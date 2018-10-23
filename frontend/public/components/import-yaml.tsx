import * as React from 'react';
import withDragDropContext from './utils/drag-drop-context';
import { AsyncComponent } from './utils';


export const ImportYamlPage = withDragDropContext(class ImportYamlPage extends React.Component {
  render() {
    return <React.Fragment>
      <div className="yaml-editor__header">
        <div>Import YAML</div>
        <div className="yaml-editor__subheader">Create resources from their YAML or JSON definitions.</div>
      </div>
      <AsyncComponent loader={() => import('./edit-yaml').then(c => c.EditYAML)} create={true} showHeader={false} download={false} />
    </React.Fragment>;
  }
});
