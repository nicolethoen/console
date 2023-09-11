/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import * as _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import * as classNames from 'classnames';

import {
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
  Button,
  ValidatedOptions,
  Icon,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { global_palette_blue_300 as blueInfoColor } from '@patternfly/react-tokens/dist/js/global_palette_blue_300';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useFlag } from '@console/shared/src/hooks/flag';
import { RedExclamationCircleIcon, useDeepCompareMemoize } from '@console/shared';
import { setEncryptionDispatch, parseURL, kmsConfigValidation, isLengthUnity } from './utils';
import { KMSConfigureProps, EncryptionDispatch } from './providers';
import {
  VaultTokenConfigure,
  VaultServiceAccountConfigure,
  VaultAuthMethodProps,
} from './vault-auth-methods';
import { State } from '../ocs-install/attached-devices-mode/reducer';
import { InternalClusterState, ActionType } from '../ocs-install/internal-mode/reducer';
import { WizardState } from '../create-storage-system/reducer';
import { FEATURES } from '../../features';
import { advancedVaultModal } from '../modals/advanced-kms-modal/advanced-vault-modal';

import {
  VaultConfig,
  ProviderNames,
  VaultAuthMethods,
  KmsEncryptionLevel,
  VaultAuthMethodMapping,
} from '../../types';

import './kms-config.scss';

export const VaultConfigure: React.FC<KMSConfigureProps> = ({
  state,
  dispatch,
  className,
  mode,
  isWizardFlow,
  isMCG,
}) => {
  const { t } = useTranslation();

  const isKmsVaultSASupported = useFlag(FEATURES.ODF_VAULT_SA_KMS);

  const vaultState: VaultConfig = useDeepCompareMemoize(
    state.kms?.[ProviderNames.VAULT] || state.kms,
    true,
  );

  const vaultStateClone: VaultConfig = React.useMemo(() => _.cloneDeep(vaultState), [vaultState]);

  const { encryption } = state;

  const updateVaultState = React.useCallback(
    (vaultConfig: VaultConfig) => {
      mode
        ? setEncryptionDispatch(ActionType.SET_KMS_ENCRYPTION, mode, dispatch, vaultConfig)
        : dispatch({
            type: 'securityAndNetwork/setVault',
            payload: vaultConfig,
          });
    },
    [dispatch, mode],
  );

  const setAuthValue = React.useCallback(
    (authValue: string) => {
      vaultStateClone.authValue.value = authValue;
      vaultStateClone.authValue.valid = authValue !== '';
      updateVaultState(vaultStateClone);
    },
    [updateVaultState, vaultStateClone],
  );

  const setAuthMethod = React.useCallback(
    (authMethod: VaultAuthMethods) => {
      !!vaultStateClone.authMethod && setAuthValue('');
      vaultStateClone.authMethod = authMethod;
      updateVaultState(vaultStateClone);
    },
    [setAuthValue, updateVaultState, vaultStateClone],
  );

  const filteredVaultAuthMethodMapping = React.useMemo(
    () =>
      Object.values(VaultAuthMethodMapping).filter(
        (authMethod) =>
          (encryption.clusterWide || isMCG
            ? authMethod.supportedEncryptionType.includes(KmsEncryptionLevel.CLUSTER_WIDE)
            : false) ||
          (encryption.storageClass
            ? authMethod.supportedEncryptionType.includes(KmsEncryptionLevel.STORAGE_CLASS)
            : false),
      ),
    [encryption.clusterWide, encryption.storageClass, isMCG],
  );

  const vaultAuthMethods = React.useMemo(
    () => filteredVaultAuthMethodMapping.map((authMethod) => authMethod.value),
    [filteredVaultAuthMethodMapping],
  );

  React.useEffect(() => {
    if (!vaultAuthMethods.includes(vaultState.authMethod)) {
      if (isKmsVaultSASupported && vaultAuthMethods.includes(VaultAuthMethods.KUBERNETES)) {
        // From 4.10 kubernetes is default auth method
        setAuthMethod(VaultAuthMethods.KUBERNETES);
      } else {
        // upto 4.9 token is the default auth method
        setAuthMethod(VaultAuthMethods.TOKEN);
      }
    }
  }, [isKmsVaultSASupported, setAuthMethod, vaultAuthMethods, vaultState.authMethod]);

  return (
    <>
      {isKmsVaultSASupported && (
        <FormGroup
          fieldId="authentication-method"
          label={t('ceph-storage-plugin~Authentication method')}
          className={`${className}__form-body`}
          isRequired
        >
          <FormSelect
            value={vaultState.authMethod}
            onChange={(_event, value) => setAuthMethod(value as VaultAuthMethods)}
            id="authentication-method"
            name="authentication-method"
            aria-label={t('ceph-storage-plugin~authentication-method')}
            isDisabled={isLengthUnity(vaultAuthMethods)}
          >
            {filteredVaultAuthMethodMapping.map((authMethod) => (
              <FormSelectOption
                value={authMethod.value}
                label={authMethod.name}
                key={authMethod.name}
              />
            ))}
          </FormSelect>

          {!vaultState.authMethod && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant="error" icon={<RedExclamationCircleIcon />}>
                  {t('ceph-storage-plugin~This is a required field.')}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      )}
      <VaultConnectionForm
        {...{
          t,
          state,
          vaultState,
          className,
          mode,
          isWizardFlow,
          dispatch,
          updateVaultState,
          setAuthValue,
        }}
      />
    </>
  );
};

const VaultConnectionForm: React.FC<VaultConnectionFormProps> = ({
  t,
  state,
  vaultState,
  className,
  mode,
  isWizardFlow,
  dispatch,
  updateVaultState,
  setAuthValue,
}) => {
  const vaultStateClone: VaultConfig = _.cloneDeep(vaultState);
  const Component: React.FC<VaultAuthMethodProps> =
    vaultState.authMethod === VaultAuthMethods.TOKEN
      ? VaultTokenConfigure
      : VaultServiceAccountConfigure;

  // Webhook
  React.useEffect(() => {
    const hasHandled: boolean =
      vaultState.authValue?.valid &&
      vaultState.authValue?.value !== '' &&
      kmsConfigValidation(vaultState, ProviderNames.VAULT);
    if (vaultState.hasHandled !== hasHandled) {
      mode
        ? setEncryptionDispatch(ActionType.SET_KMS_ENCRYPTION, mode, dispatch, {
            ...vaultState,
            hasHandled,
          })
        : dispatch({
            type: 'securityAndNetwork/setVault',
            payload: {
              ...vaultState,
              hasHandled,
            },
          });
    }
  }, [dispatch, mode, vaultState]);

  const openAdvancedModal = () =>
    advancedVaultModal({
      state,
      dispatch,
      mode,
      isWizardFlow,
    });

  // vault state update
  const setServiceName = (_event, name: string) => {
    vaultStateClone.name.value = name;
    vaultStateClone.name.valid = name !== '';
    updateVaultState(vaultStateClone);
  };

  const setAddress = (_event, address: string) => {
    vaultStateClone.address.value = address;
    vaultStateClone.address.valid = address !== '' && parseURL(address.trim()) != null;
    updateVaultState(vaultStateClone);
  };

  const setAddressPort = (_event, port: string) => {
    vaultStateClone.port.value = port;
    vaultStateClone.port.valid =
      port !== '' && !_.isNaN(Number(port)) && Number(port) > 0 && Number(port) < 65536;
    updateVaultState(vaultStateClone);
  };

  const validateAddressMessage = () =>
    vaultState.address.value === ''
      ? t('ceph-storage-plugin~This is a required field.')
      : t('ceph-storage-plugin~Please enter a URL.');

  const validatePortMessage = () =>
    vaultState.port.value === ''
      ? t('ceph-storage-plugin~This is a required field.')
      : t('ceph-storage-plugin~Please enter a valid port.');

  const isValid = (value: boolean) => (value ? ValidatedOptions.default : ValidatedOptions.error);

  const { encryption } = state;
  const isScEncryption = encryption.storageClass;

  return (
    <>
      <FormGroup
        fieldId="kms-service-name"
        label={t('ceph-storage-plugin~Connection name')}
        className={`${className}__form-body`}
        isRequired
      >
        <TextInput
          value={vaultState.name?.value}
          onChange={setServiceName}
          type="text"
          id="kms-service-name"
          name="kms-service-name"
          isRequired
          validated={isValid(vaultState.name?.valid)}
          data-test="kms-service-name-text"
        />

        <FormHelperText>
          <HelperText>
            {!isValid(vaultState.name?.valid) ? (
              <HelperTextItem variant="error" icon={<RedExclamationCircleIcon />}>
                {t('ceph-storage-plugin~This is a required field.')}
              </HelperTextItem>
            ) : (
              <HelperTextItem>
                {t(
                  'ceph-storage-plugin~A unique name for the key management service within the project.',
                )}
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <div className="ocs-install-kms__form-url">
        <FormGroup
          fieldId="kms-address"
          label={t('ceph-storage-plugin~Address')}
          className={classNames('ocs-install-kms__form-address', `${className}__form-body`)}
          isRequired
        >
          <TextInput
            value={vaultState.address?.value}
            onChange={setAddress}
            className="ocs-install-kms__form-address--padding"
            type="url"
            id="kms-address"
            name="kms-address"
            isRequired
            validated={isValid(vaultState.address?.valid)}
            data-test="kms-address-text"
          />

          <FormHelperText>
            <HelperText>
              {!isValid(vaultState.address?.valid) && (
                <HelperTextItem variant="error" icon={<RedExclamationCircleIcon />}>
                  {validateAddressMessage()}
                </HelperTextItem>
              )}
            </HelperText>
          </FormHelperText>
        </FormGroup>
        <FormGroup
          fieldId="kms-address-port"
          label={t('ceph-storage-plugin~Port')}
          className={classNames(
            'ocs-install-kms__form-port',
            `${className}__form-body--small-padding`,
          )}
          isRequired
        >
          <TextInput
            value={vaultState.port?.value}
            onChange={setAddressPort}
            type="text"
            id="kms-address-port"
            name="kms-address-port"
            isRequired
            validated={isValid(vaultState.port?.valid)}
            data-test="kms-address-port-text"
          />

          <FormHelperText>
            <HelperText>
              {!isValid(vaultState.port?.valid) && (
                <HelperTextItem variant="error" icon={<RedExclamationCircleIcon />}>
                  {validatePortMessage()}
                </HelperTextItem>
              )}
            </HelperText>
          </FormHelperText>
        </FormGroup>
      </div>
      {isWizardFlow && (
        <Component
          {...{
            t,
            className: `${className}__form-body`,
            vaultState,
            setAuthValue,
            isValid,
            isScEncryption,
          }}
        />
      )}
      <Button
        variant="link"
        className={`${className}__form-body`}
        onClick={openAdvancedModal}
        data-test="kms-advanced-settings-link"
      >
        {t('ceph-storage-plugin~Advanced settings')}{' '}
        {(vaultState.backend ||
          vaultState.caCert ||
          vaultState.tls ||
          vaultState.clientCert ||
          vaultState.clientKey ||
          vaultState.providerNamespace) && (
          <Icon size="sm">
            <PencilAltIcon data-test="edit-icon" color={blueInfoColor.value} />
          </Icon>
        )}
      </Button>
    </>
  );
};

export type VaultConnectionFormProps = {
  state:
    | InternalClusterState
    | State
    | Pick<WizardState['securityAndNetwork'], 'encryption' | 'kms'>;
  vaultState: VaultConfig;
  className: string;
  mode: string;
  infraType?: string;
  isWizardFlow?: boolean;
  t: TFunction;
  dispatch: EncryptionDispatch;
  updateVaultState: (VaultConfig) => void;
  setAuthValue: (string) => void;
};
