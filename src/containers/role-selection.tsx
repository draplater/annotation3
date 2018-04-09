import {Button, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, Panel, Row} from "react-bootstrap";
import * as React from "react";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import {rpcRequest, SMap} from "../util";
import * as BlockUi from "react-block-ui";
import "react-block-ui/style.css";

export namespace RoleSelection {
  export interface Props {
    currentArg: string;
    selected: SMap<Role, number>,
    selectedFrame: Array<string>,
    isUploading: boolean,
    onRoleSelected: (frame: string, role: string, isSelected: boolean) => void
  }

  export interface Role {
    frame: string;
    role: string;
  }

  export interface State {
    selectedFrame?: string;
    roleList: Array<Role>;
  }
}

export class RoleSelection extends React.Component<RoleSelection.Props, RoleSelection.State> {
  private frameSelectRowProp: any;
  private table: any;

  constructor(props) {
    super(props);
    this.frameSelectRowProp = {
      mode: "checkbox",
      bgColor: "rgb(238, 193, 213)",
      onSelect: this.onRoleRowSelect.bind(this),
      showOnlySelected: true,
      onSelectAll: () => false
    };
    this.table = null;

    this.state = {roleList: []};
    this.loadCorrespondingRoles();
  }

  componentWillReceiveProps(props) {
    this.loadCorrespondingRoles();
  }

  onRoleRowSelect(row, selected) {
    this.props.onRoleSelected(row.frame, row.role, selected);
    return false;
  }

  async loadCorrespondingRoles() {
    const result = await rpcRequest("get_fe", this.props.selectedFrame);
    this.setState({roleList: result});
  }

  showFrameInfo = (e) => {
    e.stopPropagation();
    this.setState({selectedFrame: e.target.textContent});
    e.preventDefault();
  };

  frameNameFormatter = (cell, row) => {
    return (
      <a onClick={this.showFrameInfo}>
        <Glyphicon glyph="info-sign"/>
        {cell}
      </a>
    );
  };

  render() {
    const BootstrapTableAny: any = BootstrapTable;

    this.frameSelectRowProp.selected = Array.from(this.props.selected).map(
      ([role, confidence]) => role.frame + "!!!" + role.role
    );

    const totalRoleList = this.state.roleList.map(({frame, role}) =>
      ({id: frame + "!!!" + role, frame, role, "confidence": 0}));
    totalRoleList.forEach(x => {
      x.confidence = this.props.selected.get({frame: x.frame, role: x.role}) || 0;
    });

    return (
      <BlockUi blocking={this.props.isUploading}>
        <Panel
          header={`Frame Annotation${this.props.isUploading ? " (Uploading)" : ""}`}
          bsStyle={this.props.isUploading ? "info" : undefined}
        >
          <p> Select corresponding role: {this.props.currentArg}</p>
          <Row>
            <Col md={4}>
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
                data={totalRoleList}
                selectRow={this.frameSelectRowProp}
                pagination={true}
                multiColumnSort={3}
                search={true}
                hover={true}
              >
                <TableHeaderColumn dataField="id" dataSort={true} isKey={true} hidden={true}>
                  ID
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="confidence"
                  dataSort={true}
                >
                  Confidence
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="frame"
                  searchable={true}
                  dataFormat={this.frameNameFormatter}
                  dataAlign="center"
                >
                  Frame
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="role"
                  dataSort={true}
                >
                  Role
                </TableHeaderColumn>
              </BootstrapTableAny>
            </Col>
            <Col md={8}>
              {/*{this.getRelatedLexicons(this.state.selectedFrame)}*/}
              {this.state.selectedFrame ?
                <iframe
                  key="selectFrame"
                  src={`api/framenet/frame/${this.state.selectedFrame}.xml`}
                  style={{width: "100%", height: "600px"}}
                />
                :
                <p> Click frame name to show description.</p>
              }
            </Col>
          </Row>
        </Panel>
      </BlockUi>
    );
  }
}
