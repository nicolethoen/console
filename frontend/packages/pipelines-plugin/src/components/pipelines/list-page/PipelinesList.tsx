import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { match as Rmatch } from 'react-router-dom';
import { Firehose } from '@console/internal/components/utils';
import { referenceForModel } from '@console/internal/module/k8s';
import { PipelineModel } from '../../../models';
import { filters } from './PipelineAugmentRuns';
import PipelineAugmentRunsWrapper from './PipelineAugmentRunsWrapper';

interface PipelinesListProps {
  match: Rmatch<any>;
}

const PipelinesList: React.FC<PipelinesListProps> = ({
  match: {
    params: { ns: namespace },
  },
}) => {
  const { t } = useTranslation();
  const resources = [
    {
      isList: true,
      kind: referenceForModel(PipelineModel),
      namespace,
      prop: PipelineModel.id,
      filters: { ...filters(t) },
    },
  ];
  return (
    <div className="co-m-pane__body">
      <Firehose resources={resources}>
        <PipelineAugmentRunsWrapper />
      </Firehose>
    </div>
  );
};

export default PipelinesList;
