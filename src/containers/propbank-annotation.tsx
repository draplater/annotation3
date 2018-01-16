import {RouteComponentProps} from "react-router";
import * as React from "react";
import {FrameSelection} from "./frame-selection";
import {Form, Pager, Panel, FormGroup, ControlLabel, FormControl} from "react-bootstrap";
import {connect} from "react-redux";
import {RootState} from "../redux/reducers";
import * as _ from "lodash";
import {getElementsByXPath, rpcRequest} from "../util";
import {SentenceViewer} from "./sentence";
import {CommentForm} from "./comment_form";
import {rpc} from "../rpc";

function renderRole(role: Element) {
  return <div> {`ARG${role.getAttribute("argnum")}: ${role.getAttribute("argrole")}`}</div>
}


function renderFrameSet(frameset: string) {
  const doc = (new DOMParser()).parseFromString(frameset, "text/xml");
  const roleList = getElementsByXPath(doc, "frameset/role", doc);
  const frameList = getElementsByXPath(doc, "frameset/frame", doc);
  return (
    <div>
      {roleList.map(x => renderRole(x))}
      <SentenceViewer sentences={frameList}/>
    </div>
  );
}

export namespace PropBankAnnotation {
  export interface OwnProps extends RouteComponentProps<void> {

  }

  export interface Props extends OwnProps {
    username: string;
  }

  export interface State {
    propbankContent: {
      name: string;
      file: string;
      idx: number;
      content: string;
    };
    selectedFrame: Map<string, number>;
    comment: string;
    isUploading: boolean;
  }

  export const defaultState: PropBankAnnotation.State = {
    propbankContent: null, selectedFrame: null, isUploading: false, comment: ""
  };
}

@connect(mapStateToProps)
export class PropbankAnnotation extends React.Component<PropBankAnnotation.Props, PropBankAnnotation.State> {
  constructor(props) {
    super(props);
    this.state = PropBankAnnotation.defaultState;
    this.loadPropBank(props);
  }

  componentWillReceiveProps(new_props) {
    this.setState(PropBankAnnotation.defaultState);
    this.loadPropBank(new_props);
  }

  async loadPropBank(props) {
    const params: any = props.match.params;
    const result = await rpcRequest("get_frameset", parseInt(params.no));
    this.setState({propbankContent: result});
    this.loadLastAnnotaion(props);
    this.loadComment(props);
  }

  async loadComment(props) {
    const p = this.state.propbankContent;
    const result = await rpcRequest("get_comment", props.username, p.file, p.idx);
    this.setState({comment: result})
  }

  async loadLastAnnotaion(props) {
    const p = this.state.propbankContent;
    const result = await rpcRequest("get_annotation", props.username, p.file, p.idx);
    this.setState({selectedFrame: new Map<string, number>(_.toPairs(result.frames))});
  }

  async changeAnnotation(frame: string, isSelected: boolean) {
    const p = this.state.propbankContent;
    console.log(this.props.username);
    if (this.props.username === "guest") {
      alert("Please set your name.");
      return;
    }
    if (isSelected) {
      const inputString = prompt("Please input confidence (1-5):");
      if (inputString === undefined) {
        return;
      }
      const confidence = parseInt(inputString);
      if (Number.isNaN(confidence) || confidence < 1 || confidence > 5) {
        alert("Please input a valid number.");
        return;
      }
      this.setState({isUploading: true});
      await rpcRequest("add_annotation", this.props.username,
        p.file, p.idx, frame, confidence);
      this.state.selectedFrame.set(frame, confidence);
    } else {
      this.setState({isUploading: true});
      await rpcRequest("del_annotation", this.props.username,
        p.file, p.idx, frame);
      this.state.selectedFrame.delete(frame);
    }
    this.setState({isUploading: false, selectedFrame: this.state.selectedFrame});
  }

  async submitComment(comment) {
    const p = this.state.propbankContent;
    if (this.props.username === "guest") {
      alert("Please set your name.");
      return;
    }
    await rpcRequest("set_comment", this.props.username,
      p.file, p.idx, comment);
    alert("Set comment successfully!");
    this.setState({comment});
  }

  prevPage() {
    const params: any = this.props.match.params;
    const no = Number.parseInt(params.no);
    this.props.history.push(`/annotate/${no - 1}`);
  }

  nextPage() {
    const params: any = this.props.match.params;
    const no = Number.parseInt(params.no);
    this.props.history.push(`/annotate/${no + 1}`);
  }

  render() {
    return (
      <div>
        <Pager>
          <Pager.Item previous onClick={this.prevPage.bind(this)}>&larr; Previous Page</Pager.Item>
          <Pager.Item next onClick={this.nextPage.bind(this)}>Next Page &rarr;</Pager.Item>
        </Pager>
        {this.state.propbankContent &&
        <Panel header="PropBank">
          <h3> {this.state.propbankContent.name} </h3>
          {renderFrameSet(this.state.propbankContent.content)}
          {/*<pre> {this.state.propbankContent.content} </pre>*/}
        </Panel>
        }

        {this.state.selectedFrame &&
        (
          <div>
            <FrameSelection
              currentPred={this.state.propbankContent.name}
              selected={this.state.selectedFrame}
              isUploading={this.state.isUploading}
              onframeSelected={this.changeAnnotation.bind(this)}
            />
            <Panel header="comment">
              <CommentForm
                onSubmit={this.submitComment.bind(this)}
                defaultValue={this.state.comment}
              />
            </Panel>
          </div>
        )
        }
        <Pager>
          <Pager.Item previous onClick={this.prevPage.bind(this)}>&larr; Previous Page</Pager.Item>
          <Pager.Item next onClick={this.nextPage.bind(this)}>Next Page &rarr;</Pager.Item>
        </Pager>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, ownProps: PropBankAnnotation.OwnProps) {
  return Object.assign({
    username: state.GlobalInfo.username,
  }, ownProps);
}
