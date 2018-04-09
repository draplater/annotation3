import {RouteComponentProps} from "react-router";
import * as React from "react";
import {FrameSelection} from "./frame-selection";
import {Form, Pager, Panel, FormGroup, ControlLabel, FormControl} from "react-bootstrap";
import {connect} from "react-redux";
import {RootState} from "../redux/reducers";
import * as _ from "lodash";
import {getElementsByXPath, rpcRequest, SMap} from "../util";
import {SentenceViewer} from "./sentence";
import {CommentForm} from "./comment_form";
import {RoleSelection} from "./role-selection";
import {XHSelection} from "./xh-selection";

const Sticky: any = require("react-stickynode");

@connect(mapStateToProps)
export class XHAnnotation extends React.Component<XHAnnotation.Props, XHAnnotation.State> {
  constructor(props) {
    super(props);
    this.state = XHAnnotation.defaultState;
    this.loadSentence(props);
  }

  componentWillReceiveProps(new_props) {
    this.setState(XHAnnotation.defaultState);
    this.loadSentence(new_props);
  }

  async loadSentence(props) {
    const params: any = props.match.params;
    const result = await rpcRequest("get_ontonote_sentence", parseInt(params.no));
    this.setState({sentenceInfo: result});
    this.loadLastAnnotaion(props);
    // this.loadComment(props);
  }

  // async loadComment(props) {
  //   const p = this.state.propbankContent;
  //   const result = await rpcRequest("get_comment", props.username, p.file, p.idx);
  //   this.setState({comment: result});
  // }

  async loadLastAnnotaion(props) {
    const p = this.state.sentenceInfo;
    const result = await rpcRequest("get_xh_annotation", props.username,
      p.sentenceID, p.wordIdx);
    const meaningMap = new Map<string, number>(
      _.toPairs(result.meanings));
    this.setState({
      selectedMeaning: meaningMap
    });
  }

  getInputConfidence() {
    if (this.props.username === "guest") {
      alert("Please set your name.");
      return;
    }
    const inputString = prompt("Please input confidence (1-5):");
    if (inputString === undefined) {
      return;
    }
    const confidence = parseInt(inputString);
    if (Number.isNaN(confidence) || confidence < 1 || confidence > 5) {
      alert("Please input a valid number.");
      return;
    }
    return confidence;
  }

  changeAnnotation = async (meaning: string, isSelected: boolean) => {
    if (this.props.username === "guest") {
      alert("请点击右上角的设置你的名字。");
      return;
    }
    const p = this.state.sentenceInfo;
    this.setState({isUploading: true});
    if (isSelected) {
      const confidence = 5;
      await rpcRequest("add_xh_annotation", this.props.username,
        p.sentenceID, p.wordIdx, meaning, confidence);
      this.state.selectedMeaning.set(meaning, confidence);
    } else {
      await rpcRequest("del_xh_annotation", this.props.username,
        p.sentenceID, p.wordIdx, meaning);
      this.state.selectedMeaning.delete(meaning);
    }
    this.setState({isUploading: false, selectedMeaning: this.state.selectedMeaning},
      () => {
        this.nextPage()
      });
  };

  //
  // changeRole = async (frame: string, role: string, isSelected: boolean) => {
  //   const p = this.state.propbankContent;
  //   this.setState({isUploading: true});
  //   if (isSelected) {
  //     const confidence = this.getInputConfidence();
  //     if (confidence === undefined) {
  //       return;
  //     }
  //     await rpcRequest("add_role", this.props.username,
  //       p.file, p.idx, frame, this.state.roleAnnotation, role, confidence);
  //     this.state.selectedRole.set({frame, role}, confidence);
  //   } else {
  //     await rpcRequest("del_role", this.props.username,
  //       p.file, p.idx, frame, this.state.roleAnnotation, role);
  //     this.state.selectedRole.delete({frame, role});
  //   }
  //   this.setState({isUploading: false, selectedFrame: this.state.selectedFrame});
  // };
  //
  // submitComment = async (comment) => {
  //   const p = this.state.propbankContent;
  //   if (this.props.username === "guest") {
  //     alert("Please set your name.");
  //     return;
  //   }
  //   await rpcRequest("set_comment", this.props.username,
  //     p.file, p.idx, comment);
  //   alert("Set comment successfully!");
  //   this.setState({comment});
  // };

  prevPage = () => {
    const params: any = this.props.match.params;
    const no = Number.parseInt(params.no);
    this.props.history.push(`/xh-annotate/${no - 1}`);
  };

  nextPage = () => {
    const params: any = this.props.match.params;
    const no = Number.parseInt(params.no);
    this.props.history.push(`/xh-annotate/${no + 1}`);
  };

  static getTokens(tree_literal: string) {
    const raw_sentence = tree_literal
      .replace(/\([^\s]*/g, "")
      .replace(/\)/g, "")
      .replace(/\s+/g, " ");
    return raw_sentence.trim().split(" ");
  }

  render() {
    const info = this.state.sentenceInfo;
    return (
      <div>
        <Pager>
          <Pager.Item previous onClick={this.prevPage}>&larr; Previous Page</Pager.Item>
          <Pager.Item next onClick={this.nextPage}>Next Page &rarr;</Pager.Item>
        </Pager>
        <Sticky innerZ={50}>
          <Panel header="Sentence" style={{height: "150px"}}>
            {(info && this.state.selectedMeaning) ?
              XHAnnotation.getTokens(info.treeLiteral).map(
                (word, idx) => <span style={{
                  "color": idx === info.wordIdx ? "blue" : "black",
                  "display": word.startsWith("*") ? "none" : undefined
                }}>{word}</span>
              ) :
              <p>Loading...</p>
            }
          </Panel>
        </Sticky>
        {(info && this.state.selectedMeaning) ?
          <XHSelection
            currentPred={""}
            selected={this.state.selectedMeaning}
            isUploading={this.state.isUploading}
            meaningList={this.state.sentenceInfo.options}
            onframeSelected={this.changeAnnotation}
          />
          :
          <div style={{height: "1500px"}}>
          </div>
        }
        <Pager>
          <Pager.Item previous onClick={this.prevPage}>&larr; Previous Page</Pager.Item>
          <Pager.Item next onClick={this.nextPage}>Next Page &rarr;</Pager.Item>
        </Pager>
      </div>
    );
  }
}


export namespace XHAnnotation {
  export interface OwnProps extends RouteComponentProps<void> {

  }

  export interface Props extends OwnProps {
    username: string;
  }

  export interface State {
    sentenceInfo: {
      treeLiteral: string;
      sentenceID: string;
      wordIdx: number;
      options: Array<[number, string, string]>
    };
    selectedMeaning: Map<string, number>;
    comment: string;
    isUploading: boolean;
  }

  export const defaultState: XHAnnotation.State = {
    sentenceInfo: null, selectedMeaning: null,
    isUploading: false, comment: ""
  };
}

function mapStateToProps(state: RootState, ownProps: XHAnnotation.OwnProps) {
  return Object.assign({
    username: state.GlobalInfo.username,
  }, ownProps);
}

