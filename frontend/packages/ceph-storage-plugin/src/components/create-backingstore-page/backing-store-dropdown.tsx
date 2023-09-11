import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@patternfly/react-core';
import {
  Dropdown as DropdownDeprecated,
  DropdownItem as DropdownItemDeprecated,
  DropdownSeparator as DropdownSeparatorDeprecated,
  DropdownToggle as DropdownToggleDeprecated,
} from '@patternfly/react-core/deprecated';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { useDeepCompareMemoize } from '@console/shared';
import CreateBackingStoreFormModal from './create-bs-modal';
import { BackingStoreKind } from '../../types';
import { backingStoreResource } from '../../resources';

export const BackingStoreDropdown: React.FC<BackingStoreDropdownProps> = ({
  id,
  namespace,
  onChange,
  className,
  selectedKey,
  creatorDisabled,
}) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = React.useState(false);

  const [nbsData, , nbsLoadErr] = useK8sWatchResource<BackingStoreKind[]>(backingStoreResource);
  const noobaaBackingStores: BackingStoreKind[] = useDeepCompareMemoize(nbsData, true);

  const [nsName, setNSName] = React.useState('');
  const handleDropdownChange = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      setNSName(e.currentTarget.id);
      onChange(noobaaBackingStores.find((nbs) => nbs?.metadata?.name === e.currentTarget.id));
    },
    [noobaaBackingStores, onChange],
  );

  const getDropdownItems = React.useCallback(
    (backingStoreList: BackingStoreKind[]) => {
      return backingStoreList.reduce(
        (res, nbs) => {
          res.push(
            <DropdownItemDeprecated
              key={nbs.metadata.uid}
              component="button"
              id={nbs?.metadata?.name}
              onClick={handleDropdownChange}
              data-test={`${nbs?.metadata?.name}-dropdown-item`}
              description={t('ceph-storage-plugin~Provider {{provider}}', {
                provider: nbs?.spec?.type,
              })}
            >
              {nbs?.metadata?.name}
            </DropdownItemDeprecated>,
          );
          return res;
        },
        !creatorDisabled
          ? [
              <DropdownItemDeprecated
                data-test="create-new-backingstore-button"
                key="first-item"
                component="button"
                onClick={() => CreateBackingStoreFormModal({ namespace })}
              >
                {t('ceph-storage-plugin~Create new BackingStore ')}
              </DropdownItemDeprecated>,
              <DropdownSeparatorDeprecated key="separator" />,
            ]
          : [],
      );
    },
    [creatorDisabled, t, handleDropdownChange, namespace],
  );

  const dropdownItems = getDropdownItems(noobaaBackingStores);

  return (
    <div className={className}>
      {nbsLoadErr && (
        <Alert
          className="nb-create-bc-step-page__danger"
          variant="danger"
          isInline
          title={t('ceph-storage-plugin~An error has occured while fetching backing stores')}
        />
      )}
      <DropdownDeprecated
        className="dropdown--full-width"
        toggle={
          <DropdownToggleDeprecated
            id="nbs-dropdown-id"
            data-test="nbs-dropdown-toggle"
            onToggle={() => setOpen(!isOpen)}
            isDisabled={!!nbsLoadErr}
          >
            {selectedKey || nsName || t('ceph-storage-plugin~Select a backing store')}
          </DropdownToggleDeprecated>
        }
        isOpen={isOpen}
        dropdownItems={dropdownItems}
        onSelect={() => setOpen(false)}
        id={id}
      />
    </div>
  );
};

type BackingStoreDropdownProps = {
  id: string;
  namespace: string;
  onChange?: (BackingStoreKind) => void;
  className?: string;
  selectedKey?: string;
  creatorDisabled?: boolean;
};
