import * as React from 'react';
import { DropTargetMonitor } from 'react-dnd';
import { EditYAMLComponent } from "./edit-yaml";

const maxFileUploadSize = 4000000;
const fileSizeErrorMsg = 'Maximum file size exceeded. File limit is 4MB.';

export class ImportYamlPage extends React.Component<ImportYamlProps, ImportYamlState> {
  constructor(props) {
    super(props);
    this.state = {
      yaml: '',
    };
    this.handleFileDrop = this.handleFileDrop.bind(this);
    this.onDataChange = this.onDataChange.bind(this);
  }
  handleFileDrop(item: any, monitor: DropTargetMonitor) {
    if (!monitor) {
      return;
    }
    const file = monitor.getItem().files[0];
    if (file.size > maxFileUploadSize) {
      this.setState({
        errorMessage: fileSizeErrorMsg,
        yaml: '',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const input = reader.result;
      this.setState({
        yaml: input,
        errorMessage: '',
      }, () => this.props.onChange(input));
    };
    reader.readAsText(file, 'UTF-8');
  }
  onDataChange(data) {
    const { fileData, errorMessage } = data;
    this.setState({
      yaml: fileData || '',
      errorMessage: errorMessage || '',
    }, () => this.props.onChange(this.state.yaml));
  }
  render() {
    return <React.Fragment>
      <div className="yaml-editor__header">
        <div>Import YAML</div>
        <div className="yaml-editor__subheader">Create resources from their YAML or JSON definitions.</div>
      </div>
      <EditYAMLComponent
        {...this.props}
        errorMessage={this.state.errorMessage}
        onDrop={this.handleFileDrop}
        onChange={this.onDataChange}
        inputFileData={this.state.yaml} />;
    </React.Fragment>;
  }

}

/* eslint-disable no-undef */
export type ImportYamlState = {
  yaml: string,
  errorMessage?: string,
};

export type ImportYamlProps = {
  obj: any,
  onChange: Function,
};
/* eslint-enable no-undef */

