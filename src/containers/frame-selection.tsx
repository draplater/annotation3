import {Button, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, Panel, Row} from "react-bootstrap";
import * as React from "react";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import {getElementsByXPath, rpcRequest} from "../util";
import * as BlockUi from "react-block-ui";
import "react-block-ui/style.css";

export namespace FrameSelection {
  export interface Props {
    currentPred: string;
    selected?: Map<string, number>,
    isUploading: boolean,
    onframeSelected: (frame: string, isSelected: boolean) => void
  }

  export interface State {
    selectedFrame?: string;
    frameList: Array<string>;
    predFrameList: Set<string>;
  }
}

export class FrameSelection extends React.Component<FrameSelection.Props, FrameSelection.State> {
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

    this.state = {frameList: [], predFrameList: new Set()};
    this.loadFrameIndex();
    this.loadCorrespondingFrames();
  }

  componentWillReceiveProps(props) {
    this.loadCorrespondingFrames();
  }

  onFrameRowSelect(row, selected) {
    this.props.onframeSelected(row.frame, selected);
    return false;
  }

  async loadFrameIndex() {
    let xmlObj;

    try {
      const resp = await fetch("api/framenet/frameIndex.xml");
      const content = await resp.text();
      xmlObj = (new DOMParser()).parseFromString(content, "text/xml");
    } catch (e) {
      alert(e);
    }

    const frameList = getElementsByXPath(xmlObj, "ns:frameIndex/ns:frame",
      xmlObj, () => "http://framenet.icsi.berkeley.edu")
      .map(x => x.getAttribute("name"));

    frameList.push("__不标注__");
    frameList.push("__待标注__");
    frameList.push("__句法分析有误__");
    frameList.push("__无适合Frame__");

    this.setState({frameList});
  }

  async loadCorrespondingFrames() {
    const result = await rpcRequest("get_verb_to_frames", this.props.currentPred);
    this.setState({predFrameList: new Set<string>(result)},
      () => {
        this.table.handleSort("asc", "frame");
        this.table.handleSort("desc", "score");
        this.table.handleSort("desc", "confidence");
      });
  }

  showFrameInfo(e) {
    e.stopPropagation();
    this.setState({selectedFrame: e.target.textContent},
      () => {
        this.table.handleSort("asc", "frame");
        this.table.handleSort("desc", "score");
        this.table.handleSort("desc", "confidence");
      });
    e.preventDefault();
  }

  frameNameFormatter(cell, row) {
    return (
      <a onClick={this.showFrameInfo.bind(this)}>
        <Glyphicon glyph="info-sign"/>
        {cell}
      </a>
    );
  }

  render() {
    const BootstrapTableAny: any = BootstrapTable;
    this.frameSelectRowProp.selected = Array.from(this.props.selected.keys());
    const totalFrameList = this.state.frameList.map(x =>
      ({"frame": x, "score": 100, "confidence": 0}));
    totalFrameList.forEach(x => {
      if (this.state.predFrameList.has(x.frame)) {
        x.score += 1;
      }
      x.confidence = this.props.selected.get(x.frame) || 0;
    });

    return (
      <BlockUi blocking={this.props.isUploading}>
        <Panel
          header={`Frame Annotation${this.props.isUploading ? " (Uploading)" : ""}`}
          bsStyle={this.props.isUploading ? "info" : undefined}
        >
          <p> Select corresponding frame: {this.props.currentPred}</p>
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
                data={totalFrameList}
                selectRow={this.frameSelectRowProp}
                pagination={true}
                multiColumnSort={3}
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
                  dataField="frame"
                  isKey={true}
                  searchable={true}
                  dataFormat={this.frameNameFormatter.bind(this)}
                  dataAlign="center"
                >
                  Frame
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="score"
                  dataSort={true}
                >
                  Score
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
