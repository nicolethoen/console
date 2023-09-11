import * as React from 'react';
import * as _ from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { RedExclamationCircleIcon, useDeepCompareMemoize } from '@console/shared';
import { kmsConfigValidation } from './utils';
import { KMSConfigureProps } from './providers';
import { HpcsConfig, HPCSParams, ProviderNames } from '../../types';
import './kms-config.scss';

const IBM_TOKEN_URL = 'https://iam.cloud.ibm.com/oidc/token';

export const HpcsConfigure: React.FC<KMSConfigureProps> = ({ state, dispatch, className }) => {
  const { t } = useTranslation();

  const kms: HpcsConfig = useDeepCompareMemoize(state.kms?.[ProviderNames.HPCS], true);
  const kmsObj: HpcsConfig = React.useMemo(() => _.cloneDeep(kms), [kms]);

  React.useEffect(() => {
    const hasHandled: boolean = kmsConfigValidation(kms, ProviderNames.HPCS);
    if (kms.hasHandled !== hasHandled)
      dispatch({
        type: 'securityAndNetwork/setHpcs',
        payload: {
          ...kms,
          hasHandled,
        },
      });
  }, [dispatch, kms]);

  const setParams = (param: string, isRequired: boolean = true) => (value: string) => {
    if (isRequired) {
      kmsObj[param].value = value;
      kmsObj[param].valid = value !== '';
    } else {
      kmsObj[param] = value;
    }
    dispatch({
      type: 'securityAndNetwork/setHpcs',
      payload: kmsObj,
    });
  };

  const isValid = (value: boolean) => (value ? ValidatedOptions.default : ValidatedOptions.error);

  return (
    <>
      <FormGroup
        fieldId="kms-service-name"
        label={t('ceph-storage-plugin~Connection name')}
        className={`${className}__form-body`}
        isRequired
      >
        <TextInput
          value={kms.name?.value}
          onChange={(_event, value) => setParams(HPCSParams.NAME)(value)}
          type="text"
          id="kms-service-name"
          name="kms-service-name"
          isRequired
          validated={isValid(kms.name?.valid)}
          data-test="kms-service-name-text"
        />

        <FormHelperText>
          <HelperText>
            {!isValid(kms.name?.valid) ? (
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
      <FormGroup
        fieldId="kms-instance-id"
        label={t('ceph-storage-plugin~Service instance ID')}
        className={`${className}__form-body`}
        isRequired
      >
        <TextInput
          value={kms.instanceId?.value}
          onChange={(_event, value) => setParams(HPCSParams.INSTANCE_ID)(value)}
          type="text"
          id="kms-instance-id"
          name="kms-instance-id"
          isRequired
          validated={isValid(kms.instanceId?.valid)}
          data-test="kms-instance-id-text"
        />

        <FormHelperText>
          <HelperText>
            {!isValid(kms.instanceId?.valid) && (
              <HelperTextItem variant="error" icon={<RedExclamationCircleIcon />}>
                {t('ceph-storage-plugin~This is a required field.')}
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <FormGroup
        fieldId="kms-api-key"
        label={t('ceph-storage-plugin~Service API key')}
        className={`${className}__form-body`}
        isRequired
      >
        <TextInput
          value={kms.apiKey?.value}
          onChange={(_event, value) => setParams(HPCSParams.API_KEY)(value)}
          type="text"
          id="kms-api-key"
          name="kms-api-key"
          isRequired
          validated={isValid(kms.apiKey?.valid)}
          data-test="kms-api-key-text"
        />

        <FormHelperText>
          <HelperText>
            {!isValid(kms.apiKey?.valid) && (
              <HelperTextItem variant="error" icon={<RedExclamationCircleIcon />}>
                {t('ceph-storage-plugin~This is a required field.')}
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <FormGroup
        fieldId="kms-root-key"
        label={t('ceph-storage-plugin~Customer root key')}
        className={`${className}__form-body`}
        isRequired
      >
        <TextInput
          value={kms.rootKey?.value}
          onChange={(_event, value) => setParams(HPCSParams.ROOT_KEY)(value)}
          type="text"
          id="kms-root-key"
          name="kms-root-key"
          isRequired
          validated={isValid(kms.rootKey?.valid)}
          data-test="kms-root-key-text"
        />

        <FormHelperText>
          <HelperText>
            {!isValid(kms.rootKey?.valid) && (
              <HelperTextItem variant="error" icon={<RedExclamationCircleIcon />}>
                {t('ceph-storage-plugin~This is a required field.')}
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <FormGroup
        fieldId="kms-base-url"
        label={t('ceph-storage-plugin~IBM Base URL')}
        className={`${className}__form-body`}
        isRequired
      >
        <TextInput
          value={kms.baseUrl?.value}
          onChange={(_event, value) => setParams(HPCSParams.BASE_URL)(value)}
          type="text"
          id="kms-base-url"
          name="kms-base-url"
          isRequired
          validated={isValid(kms.baseUrl?.valid)}
          data-test="kms-base-url"
        />

        <FormHelperText>
          <HelperText>
            {!isValid(kms.baseUrl?.valid) && (
              <HelperTextItem variant="error" icon={<RedExclamationCircleIcon />}>
                {t('ceph-storage-plugin~This is a required field.')}
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <FormGroup
        fieldId="kms-token-url"
        label={t('ceph-storage-plugin~IBM Token URL')}
        className={`${className}__form-body`}
      >
        <TextInput
          value={kms.tokenUrl}
          onChange={(_event, value) => setParams(HPCSParams.TOKEN_URL, false)(value)}
          placeholder={IBM_TOKEN_URL}
          type="text"
          id="kms-token-url"
          name="kms-token-url"
          data-test="kms-token-url"
        />
      </FormGroup>
    </>
  );
};
