import * as React from "react";
import {Button, Pagination, Panel} from "react-bootstrap";
import {getElementsByXPath} from "../util";
import {parse_parenthesis, Tree, TreeViewer} from "./tree";

export class SentenceViewer extends React.Component<SentenceViewer.Props, SentenceViewer.State> {
  constructor(props) {
    super(props);
    this.state = SentenceViewer.defaultState;
  }

  componentWillReceiveProps(new_props) {
    if (this.props.sentences.map(x => x.textContent).join(",") !==
      new_props.sentences.map(x => x.textContent).join(",")) {
      this.setState(SentenceViewer.defaultState);
    }
  }

  static renderSentence(tree_literal: string) {
    const raw_sentence = tree_literal.replace(/-NONE- [^)]+/g, "")
      .replace(/\([^\s]*/g, "")
      .replace(/\)/g, "");
    return <p> {raw_sentence} </p>;
  }

  renderRole = (role: Element) => {
    const argType = "ARG" + role.getAttribute("n");
    const description = role.textContent;
    return (
      <div>
        <a
          onClick={() => {
            this.props.onRoleSelected(argType);
          }}
          className={this.props.roleAnnotation === argType ? "blinking" : undefined}
        >
          {argType}
        </a>
        :{description}
      </div>
    );
  };

  render() {
    const sentenceNode = this.props.sentences[this.state.currentSentence];
    const parse: Element = getElementsByXPath(sentenceNode.ownerDocument,
      "./example/parse", sentenceNode)[0];
    const args: Element[] = getElementsByXPath(sentenceNode.ownerDocument,
      "./example/arg", sentenceNode);
    const tree_literal = parse.textContent;
    return (
      <div>
        {this.props.sentences.length > 1 &&
        <Pagination
          prev
          next
          items={this.props.sentences.length}
          activePage={this.state.currentSentence + 1}
          onSelect={(key) => {
            this.setState({currentSentence: key - 1})
          }}
        />
        }
        {SentenceViewer.renderSentence(tree_literal)}
        {args.map((x, idx) => <p key={idx}>{this.renderRole(x)}</p>)}
        <Button
          bsSize="xsmall"
          onClick={() => this.setState({showCFG: !this.state.showCFG})}
        >
          Show Syntax Tree
        </Button>
        <p>
          {this.state.showCFG &&
          <TreeViewer tree_literal={"(TOP " + tree_literal + ")"}/>
          }
        </p>
      </div>
    );
  }
}

export namespace SentenceViewer {
  export interface Props {
    sentences: Element[];
    roleAnnotation: string | null;
    onRoleSelected: (role: string) => void;
  }

  export interface State {
    currentSentence: number;
    showCFG: boolean
  }

  export const defaultState: State = {currentSentence: 0, showCFG: false};
}
