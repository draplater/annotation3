/**
 * Created by draplater on 16-9-16.
 */

import * as React from "react";
import * as _ from "lodash";
import * as ReactDOM from "react-dom";

export function parse_parenthesis(s) {
  if (s.startsWith("( "))
    s = s.substr(2);
  var stack = [];
  var str_buf = "";
  var is_fill_label = true; // True: fill label, False: fill terminal
  for (var i = 0, len = s.length; i < len; i++) {
    var c = s[i];
    if (c === "(") {
      is_fill_label = true;
    } else if (c === " " || c === "\n") {
      if (is_fill_label) {
        is_fill_label = false;
        stack.push({"name": str_buf.trim(), "children": []});
        str_buf = "";
      }
    } else if (c === ")") {
      //noinspection UnnecessaryLocalVariableJS
      var top = stack.pop();
      if (!stack.length) {
        return top;
      }
      if (str_buf) {
        top["children"] = str_buf.trim();
        str_buf = "";
      }
      stack[stack.length - 1]["children"].push(top);
    } else if (c === "\r") {
      // pass
    } else {
      str_buf += c;
    }
  }
}

export class Tree extends React.Component<Tree.Props, Tree.State> {
  public static defaultProps: Tree.Props = {
    transX: undefined,
    transY: 0,
    childID: 0,
    sendMetric: function () {
    }
  };

  constructor(props) {
    super(props);
    this.state = Tree.defaultState;
  }

  updateBBox() {
    // Trigger re-rendering
    const thisNode = ReactDOM.findDOMNode(this) as SVGGraphicsElement;
    const bbox = thisNode.getBBox();
    const bboxObj = {
      width: bbox.width,
      height: bbox.height
    };

    const textNode = ReactDOM.findDOMNode(this.refs.text) as SVGGraphicsElement;
    const textBBox = textNode.getBBox();
    const textBBoxObj = {
      width: textBBox.width,
      height: textBBox.height
    };

    if (!this.state ||
      !_.isEqual(bboxObj, this.state.bbox) ||
      !_.isEqual(textBBoxObj, this.state.textBBox)) {
      this.setState({
        bbox: bboxObj,
        textBBox: textBBoxObj
      });
      //try {
      this.props.parent.receiveChildMetric(this.props.childID, bbox);
      //} catch (TypeError) {
      //    console.log("not send metric.");

      //}
    }
  }

  componentDidMount() {
    // Will trigger a re-rendering at mount
    this.updateBBox();
  }

  /*
   componentDidUpdate(prevProps, prevState) {
   // If content has changed, re-render
   if (this.props.data !== prevProps.data || this.props.name !== prevProps.name) {
   this.updateBBox();
   }

   if(!prevState) {
   return;
   }

   for(var i in this.state) {
   if(i.startsWith("child") && this.state[i] !== prevState[i]) {
   this.updateBBox();
   return;
   }
   }
   }*/

  componentDidUpdate(prevProps, prevState) {
    // If content has changed, re-render
    this.updateBBox();
  }

  componentWillReceiveProps() {
    this.updateBBox();
  }

  calculateWidth() {
    try {
      return this.state.bbox.width;
    } catch (TypeError) {
      return 15;
    }
  }

  calculateTextWidth() {
    try {
      return this.state.textBBox.width;
    } catch (TypeError) {
      return 15;
    }
  }


  receiveChildMetric(childID, bbox) {
    const obj = {};
    obj["child" + childID] = bbox;
    if (this.state["child" + childID] !== bbox) {
      this.setState(obj);
    }
  }

  render() {
    let total_width;
    let transX;
    const subtrees = [];
    const fontHeight = 30;
    const span = 10;
    let transY = this.props.transY || fontHeight;
    const data = this.props.data;
    if (typeof(data.children) === "string" && data.children) {
      const tmp = data.children;
      const obj = {name: tmp, children: []};
      obj[tmp] = "";
      data.children = [];
      data.children.push(obj);
    }

    if (typeof(data.children) === "object") {
      total_width = 0;
      const width_array = [];
      let id = 0;
      for (; id < data.children.length; id++) {
        try {
          width_array[id] = this.state["child" + id].width;
        } catch (TypeError) {
          width_array[id] = 15;
        }
        total_width += width_array[id] + span;
      }
      if (id !== 0) {
        total_width -= span;
      }


      let current_pos = -total_width / 2;
      for (let i = 0; i < data.children.length; i++) {
        const key = (this.props.reactKey ? this.props.reactKey : "tree") + i.toString();
        subtrees.push((
          <Tree
            childID={i}
            key={key}
            reactKey={key}
            parent={this}
            data={data.children[i]}
            transX={current_pos + width_array[i] / 2}
            transY={transY}
          />
        ));

        // TODO: change "15" to actual height
        subtrees.push((
          <line
            key={"line-" + key}
            style={{
              stroke: "rgb(99,99,99)",
              strokeWidth: 2
            }}
            x1="0"
            y1="15"
            x2={current_pos + width_array[i] / 2}
            y2={transY}
          />));
        current_pos += width_array[i] + span;
      }
    }
    if (this.props.transX === undefined) {
      transX = total_width / 2;
      transY = 0;
    } else {
      transX = this.props.transX;
      transY = fontHeight;
    }
    return (
      <g transform={"translate(" + transX + " " + transY + ")"}>
        <text
          x={-this.calculateTextWidth() / 2}
          y="15"
          className="tree"
          ref="text"
        >{this.props.data.name}
        </text>
        {subtrees}
      </g>
    );
  }
}

export namespace Tree {
  export interface Props {
    transX?: number,
    transY?: number,
    childID?: number,
    sendMetric?: any,
    reactKey?: any,
    data?: any,
    parent?: any
  }

  export interface State {
    bbox: {
      width: number,
      height: number
    },
    textBBox: {
      width: number,
      height: number
    }
  }

  export const defaultState: State = {
    bbox: {
      width: 0,
      height: 0
    },
    textBBox: {
      width: 0,
      height: 0
    }
  };
}


export class TreeViewer extends React.Component<TreeViewer.Props, TreeViewer.State> {
  constructor(props) {
    super(props);
    this.state = TreeViewer.defaultState;
  }

  receiveChildMetric(childID, bbox) {
    this.setState({width: bbox.width, height: bbox.height});
  }

  render() {
    const tree = parse_parenthesis(this.props.tree_literal);
    return (
      <svg width={this.state.width} height={this.state.height+15}>
        <Tree parent={this} data={tree}/>
      </svg>
    );
  }
}

export namespace TreeViewer {
  export interface Props {
    tree_literal: string;
  }

  export interface State {
    width: number,
    height: number
  }

  export const defaultState: State = {width: 0, height: 0}
}
