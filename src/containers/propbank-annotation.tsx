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
    roleAnnotation: string | null; // null: not annotating role but frame
    selectedFrame: Map<string, number>;
    selectedRole: SMap<RoleSelection.Role, number>;
    comment: string;
    isUploading: boolean;
  }

  export const defaultState: PropBankAnnotation.State = {
    propbankContent: null, selectedFrame: null, selectedRole: null,
    roleAnnotation: null, isUploading: false, comment: ""
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
    this.setState({comment: result});
  }

  async loadLastAnnotaion(props) {
    const p = this.state.propbankContent;
    const result = await rpcRequest("get_annotation", props.username, p.file, p.idx);
    this.setState({selectedFrame: new Map<string, number>(_.toPairs(result.frames))});
  }

  async loadLastRoleAnnotation() {
    const p = this.state.propbankContent;
    const result = await rpcRequest("get_role",
      this.props.username, p.file, p.idx, this.state.roleAnnotation);
    const roleMap = new SMap<RoleSelection.Role, number>();
    result.roles.forEach(([frame, role, confidence]) => {
      roleMap.set({frame: frame, role: role}, confidence);
    });
    this.setState({selectedRole: roleMap, isUploading: false});
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

  changeAnnotation = async (frame: string, isSelected: boolean) => {
    const p = this.state.propbankContent;
    this.setState({isUploading: true});
    if (isSelected) {
      const confidence = this.getInputConfidence();
      if (confidence === undefined) {
        return;
      }
      await rpcRequest("add_annotation", this.props.username,
        p.file, p.idx, frame, confidence);
      this.state.selectedFrame.set(frame, confidence);
    } else {
      await rpcRequest("del_annotation", this.props.username,
        p.file, p.idx, frame);
      this.state.selectedFrame.delete(frame);
    }
    this.setState({isUploading: false, selectedFrame: this.state.selectedFrame});
  };

  changeRole = async (frame: string, role: string, isSelected: boolean) => {
    const p = this.state.propbankContent;
    this.setState({isUploading: true});
    if (isSelected) {
      const confidence = this.getInputConfidence();
      if (confidence === undefined) {
        return;
      }
      await rpcRequest("add_role", this.props.username,
        p.file, p.idx, frame, this.state.roleAnnotation, role, confidence);
      this.state.selectedRole.set({frame, role}, confidence);
    } else {
      await rpcRequest("del_role", this.props.username,
        p.file, p.idx, frame, this.state.roleAnnotation, role);
      this.state.selectedRole.delete({frame, role});
    }
    this.setState({isUploading: false, selectedFrame: this.state.selectedFrame});
  };

  submitComment = async (comment) => {
    const p = this.state.propbankContent;
    if (this.props.username === "guest") {
      alert("Please set your name.");
      return;
    }
    await rpcRequest("set_comment", this.props.username,
      p.file, p.idx, comment);
    alert("Set comment successfully!");
    this.setState({comment});
  };

  prevPage = () => {
    const params: any = this.props.match.params;
    const no = Number.parseInt(params.no);
    this.props.history.push(`/annotate/${no - 1}`);
  };

  nextPage = () => {
    const params: any = this.props.match.params;
    const no = Number.parseInt(params.no);
    this.props.history.push(`/annotate/${no + 1}`);
  };

  selectRole = (role) => {
    this.setState({roleAnnotation: role, isUploading: true},
      () => {
        this.loadLastRoleAnnotation()
      });
  };

  renderRole = (role: Element) => {
    const argType = "ARG" + role.getAttribute("argnum");
    const description = role.getAttribute("argrole");
    return (
      <div>
        <a
          onClick={() => {
            this.selectRole(argType)
          }}
          className={this.state.roleAnnotation === argType ? "blinking" : undefined}
        >
          {argType}
        </a>
        :{description}
      </div>
    );
  };


  renderFrameSet = (frameset: string) => {
    const doc = (new DOMParser()).parseFromString(frameset, "text/xml");
    const roleList = getElementsByXPath(doc, "frameset/role", doc);
    const frameList = getElementsByXPath(doc, "frameset/frame", doc);
    return (
      <div>
        {roleList.map(x => this.renderRole(x))}
        <SentenceViewer
          sentences={frameList}
          roleAnnotation={this.state.roleAnnotation}
          onRoleSelected={role => {
            this.selectRole(role);
          }}
        />
      </div>
    );
  };

  render() {
    return (
      <div>
        <Pager>
          <Pager.Item previous onClick={this.prevPage}>&larr; Previous Page</Pager.Item>
          <Pager.Item next onClick={this.nextPage}>Next Page &rarr;</Pager.Item>
        </Pager>
        {this.state.propbankContent &&
        <Panel header="PropBank">
          <h3
            onClick={() => {
              this.setState({roleAnnotation: null})
            }}
          >
            {this.state.propbankContent.name}
          </h3>
          {this.renderFrameSet(this.state.propbankContent.content)}
          {/*<pre> {this.state.propbankContent.content} </pre>*/}
        </Panel>
        }

        {this.state.roleAnnotation === null ?
          (this.state.selectedFrame &&
            (
              <div>
                <FrameSelection
                  currentPred={this.state.propbankContent.name}
                  selected={this.state.selectedFrame}
                  isUploading={this.state.isUploading}
                  onframeSelected={this.changeAnnotation}
                />
                <Panel header="comment">
                  <CommentForm
                    onSubmit={this.submitComment}
                    defaultValue={this.state.comment}
                  />
                </Panel>
              </div>
            )
          ) :
          (
            this.state.selectedRole &&
            <RoleSelection
              currentArg={this.state.roleAnnotation}
              selectedFrame={Array.from(this.state.selectedFrame.keys())}
              selected={this.state.selectedRole}
              isUploading={this.state.isUploading}
              onRoleSelected={this.changeRole}
            />
          )
        }
        <Pager>
          <Pager.Item previous onClick={this.prevPage}>&larr; Previous Page</Pager.Item>
          <Pager.Item next onClick={this.nextPage}>Next Page &rarr;</Pager.Item>
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
