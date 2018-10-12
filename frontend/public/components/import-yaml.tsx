import * as React from 'react';
import { DroppableFileInput } from './utils/file-input';

export class ImportYamlPage extends React.Component<ImportYamlProps, ImportYamlState> {
  constructor(props) {
    super(props);
    this.state = {
      yaml: props.obj || '',
    };
    this.onFileChange = this.onFileChange.bind(this);
  }
  onFileChange(fileData) {
    this.setState({
      yaml: fileData
    });
  }
  render() {
    return <React.Fragment>
      <div className="yaml-editor__header">
        <div>Import YAML</div>
        <div className="yaml-editor__subheader">Create resources from their YAML or JSON definitions.</div>
      </div>
      <DroppableFileInput
        onChange={this.onFileChange}
        inputFileData={this.state.yaml}
        id="yaml"
        label="Yaml"
        inputFieldHelpText="Upload a .yaml or .json file."
        textareaFieldHelpText="File with resource definition."
        isRequired={true}
        isYaml={true}
      />
    </React.Fragment>;
  }

}

/* eslint-disable no-undef */
export type ImportYamlState = {
  yaml: string,
};

export type ImportYamlProps = {
  obj: any,
};
/* eslint-enable no-undef */
