import {Button, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, Panel, Row} from "react-bootstrap";
import * as React from "react";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import {getElementsByXPath, rpcRequest} from "../util";
import * as BlockUi from "react-block-ui";
import "react-block-ui/style.css";

export namespace XHSelection {
  export interface Props {
    currentPred: string;
    selected?: Map<string, number>,
    isUploading: boolean,
    meaningList: Array<[number, string, string]>
    onframeSelected: (frame: string, isSelected: boolean) => void
  }

  export interface State {
  }
}

export class XHSelection extends React.Component<XHSelection.Props, XHSelection.State> {
  private frameSelectRowProp: any;
  private table: any;

  constructor(props) {
    super(props);
    this.frameSelectRowProp = {
      mode: "checkbox",
      bgColor: "rgb(238, 193, 213)",
      onSelect: this.onFrameRowSelect.bind(this),
      showOnlySelected: true,
      onSelectAll: () => false
    };
    this.table = null;

    this.state = {};
  }

  componentWillReceiveProps(props) {
  }

  onFrameRowSelect(row, selected) {
    this.props.onframeSelected(row.id, selected);
    return false;
  }

  render() {
    const BootstrapTableAny: any = BootstrapTable;
    this.frameSelectRowProp.selected = Array.from(this.props.selected.keys());
    const totalMeaningList = this.props.meaningList.map(
      ([idx, pos, meaning]) => ({"id": idx.toString(), "pos": pos, "meaning": meaning, "confidence": 0})
    );
    totalMeaningList.push({"id": "10000", "pos": "X", "meaning": "__无合适解释__", "confidence": 0});

    this.frameSelectRowProp.selected = [];
    totalMeaningList.forEach(
      x => {
        const this_confidence = this.props.selected.get(x.id);
        if(this_confidence) {
          x.confidence += this_confidence;
          this.frameSelectRowProp.selected.push(x.id);
        }
      }
    );

    return (
      <BlockUi blocking={this.props.isUploading}>
        <Panel
          header={`Frame Annotation${this.props.isUploading ? " (Uploading)" : ""}`}
          bsStyle={this.props.isUploading ? "info" : undefined}
        >
          <p> Select corresponding frame: {this.props.currentPred}</p>
          <Form inline>
            <FormGroup controlId="lexiconForm">
              <ControlLabel>Hint</ControlLabel>
              <FormControl name="hint" type="text" placeholder="Lexicon Hint"/>
            </FormGroup>
            <Button type="submit">
              Search
            </Button>
          </Form>
          <BootstrapTableAny
            ref={(table) => {
              this.table = table;
            }}
            data={totalMeaningList}
            selectRow={this.frameSelectRowProp}
            pagination={true}
            options={{sizePerPage: 50}}
            search={true}
            hover={true}
          >
            <TableHeaderColumn
              dataField="confidence"
              dataSort={true}
            >
              Confidence
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="id"
              hidden={true}
              isKey={true}
            >
              ID
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="pos"
              dataSort={true}
            >
              POS
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="meaning"
              dataSort={true}
            >
              Meaning
            </TableHeaderColumn>
          </BootstrapTableAny>
        </Panel>
      </BlockUi>
    );
  }
}
