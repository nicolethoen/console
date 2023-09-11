import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormGroup,
  Alert,
  Checkbox,
  TextContent,
  TextVariants,
  Text,
  FormHelperText,
  HelperTextItem,
  HelperText as PfHelperText,
} from '@patternfly/react-core';
import {
  Select as SelectDeprecated,
  SelectOption as SelectOptionDeprecated,
  SelectVariant as SelectVariantDeprecated,
  SelectProps as SelectPropsDeprecated,
} from '@patternfly/react-core/deprecated';
import { WizardState } from '../../reducer';

import { arbiterText } from '../../../../constants';
import { EnableArbiterLabel } from '../../../ocs-install/install-wizard/capacity-and-nodes';

const HelperText: React.FC<{ enableArbiter: boolean }> = ({ enableArbiter }) => {
  const { t } = useTranslation();

  return (
    <>
      <TextContent>
        <Text component={TextVariants.small}>
          {t(
            'ceph-storage-plugin~To support high availability when two data centers can be used, enable arbiter to get a valid quorum between the two data centers.',
          )}
        </Text>
      </TextContent>
      {enableArbiter && (
        <Alert
          title={t('ceph-storage-plugin~Arbiter minimum requirements')}
          variant="info"
          isInline
        >
          {arbiterText(t)}
        </Alert>
      )}
    </>
  );
};

export const StretchCluster: React.FC<StretchClusterProps> = ({
  onSelect,
  onChecked,
  zones,
  enableArbiter,
  arbiterLocation,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelection: SelectPropsDeprecated['onSelect'] = (e, selection) => {
    onSelect(e, selection);
    setIsOpen(false);
  };

  return (
    <>
      <TextContent>
        <Text component={TextVariants.h3}>{t('ceph-storage-plugin~Stretch Cluster')}</Text>
      </TextContent>
      <Checkbox
        aria-label={t('ceph-storage-plugin~Enable arbiter')}
        id="stretch-cluster"
        isChecked={enableArbiter}
        data-checked-state={enableArbiter}
        label={<EnableArbiterLabel />}
        description={<HelperText enableArbiter={enableArbiter} />}
        onChange={(_event, hasChecked: boolean) => {
          if (!hasChecked) onSelect(null, '');
          onChecked(hasChecked);
        }}
        body={
          enableArbiter && (
            <FormGroup
              label={t('ceph-storage-plugin~Arbiter zone')}
              fieldId="arbiter-zone-selection"
            >
              <SelectDeprecated
                variant={SelectVariantDeprecated.single}
                placeholderText={t('ceph-storage-plugin~Select an arbiter zone')}
                aria-label={t('ceph-storage-plugin~Arbiter zone selection')}
                onToggle={(_event, value: boolean) => setIsOpen(value)}
                onSelect={handleSelection}
                selections={arbiterLocation}
                isOpen={isOpen}
                id="arbiter-zone-selection"
              >
                {zones.map((zone) => (
                  <SelectOptionDeprecated key={zone} value={zone} />
                ))}
              </SelectDeprecated>

              <FormHelperText>
                <PfHelperText>
                  <HelperTextItem>
                    {t(
                      'ceph-storage-plugin~An arbiter node will be automatically selected from this zone.',
                    )}
                  </HelperTextItem>
                </PfHelperText>
              </FormHelperText>
            </FormGroup>
          )
        }
      />
    </>
  );
};

type StretchClusterProps = {
  onSelect: SelectPropsDeprecated['onSelect'];
  onChecked: (isChecked: boolean) => void;
  arbiterLocation: WizardState['capacityAndNodes']['arbiterLocation'];
  enableArbiter: WizardState['capacityAndNodes']['enableArbiter'];
  zones: string[];
};
