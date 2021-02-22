import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { navFactory } from '@console/internal/components/utils';
import { DetailsPage } from '@console/internal/components/factory';
import {
  K8sResourceKindReference,
  PersistentVolumeClaimKind,
  PodKind,
  TemplateKind,
} from '@console/internal/module/k8s';
import { PersistentVolumeClaimModel, PodModel, TemplateModel } from '@console/internal/models';
import { VMDisksFirehose } from '../vm-disks';
import { VMNics } from '../vm-nics';
import { VMTemplateDetails } from './vm-template-details';
import { match as routerMatch } from 'react-router';
import { menuActionsCreator } from './menu-actions';
import { useSupportModal } from '../../hooks/use-support-modal';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { V1alpha1DataVolume } from '../../types/api';
import { useBaseImages } from '../../hooks/use-base-images';
import { DataVolumeModel } from '../../models';
import { isCommonTemplate } from '../../selectors/vm-template/basic';
import { getTemplateSourceStatus } from '../../statuses/template/template-source-status';

export const breadcrumbsForVMTemplatePage = (t: TFunction, match: VMTemplateMatch) => () => [
  {
    name: t('kubevirt-plugin~Virtualization'),
    path: `/k8s/ns/${match.params.ns || 'default'}/virtualization`,
  },
  {
    name: t('kubevirt-plugin~Templates'),
    path: `/k8s/ns/${match.params.ns || 'default'}/virtualization/templates`,
  },
  {
    name: t('kubevirt-plugin~{{name}} Details', { name: match.params.name }),
    path: `${match.url}`,
  },
];

export const VMTemplateDetailsPage: React.FC<VMTemplateDetailsPageProps> = (props) => {
  const { t } = useTranslation();
  const { name } = props.match.params;
  const namespace = props.match.params.ns;
  const [dataVolumes, dvLoaded, dvError] = useK8sWatchResource<V1alpha1DataVolume[]>({
    kind: DataVolumeModel.kind,
    isList: true,
    namespace,
  });
  const [pods, podsLoaded, podsError] = useK8sWatchResource<PodKind[]>({
    kind: PodModel.kind,
    isList: true,
    namespace,
  });
  const [pvcs, pvcsLoaded, pvcsError] = useK8sWatchResource<PersistentVolumeClaimKind[]>({
    kind: PersistentVolumeClaimModel.kind,
    isList: true,
    namespace,
  });
  const [template, templateLoaded, templateError] = useK8sWatchResource<TemplateKind>({
    kind: TemplateModel.kind,
    namespace,
    name,
  });
  const isCommon = isCommonTemplate(template);
  const [baseImages, imagesLoaded, error, baseImageDVs, baseImagePods] = useBaseImages(
    isCommon ? [template] : [],
    isCommon,
  );
  const sourceStatus =
    templateLoaded && !templateError
      ? getTemplateSourceStatus({
          template,
          pvcs: [...baseImages, ...pvcs],
          dataVolumes: [...dataVolumes, ...baseImageDVs],
          pods: [...pods, ...baseImagePods],
        })
      : null;

  const withSupportModal = useSupportModal();
  const sourceLoaded = dvLoaded && podsLoaded && pvcsLoaded && templateLoaded && imagesLoaded;
  const sourceLoadError = dvError || podsError || pvcsError || templateError || error;

  const nicsPage = {
    href: 'nics',
    name: t('kubevirt-plugin~Network Interfaces'),
    component: VMNics,
  };

  const disksPage = {
    href: 'disks',
    name: t('kubevirt-plugin~Disks'),
    component: VMDisksFirehose,
  };

  const pages = [navFactory.details(VMTemplateDetails), navFactory.editYaml(), nicsPage, disksPage];

  return (
    <DetailsPage
      {...props}
      kind={TemplateModel.kind}
      kindObj={TemplateModel}
      name={name}
      namespace={namespace}
      menuActions={menuActionsCreator}
      pages={pages}
      breadcrumbsFor={breadcrumbsForVMTemplatePage(t, props.match)}
      customData={{
        withSupportModal,
        sourceStatus,
        sourceLoaded,
        sourceLoadError,
        withCreate: true,
      }}
    />
  );
};

type VMTemplateMatch = routerMatch<{ ns?: string; name?: string }>;

type VMTemplateDetailsPageProps = {
  name: string;
  namespace: string;
  kind: K8sResourceKindReference;
  match: VMTemplateMatch;
};
