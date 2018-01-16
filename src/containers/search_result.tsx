import * as React from "react";
import {RouteComponentProps} from "react-router";
import {Panel, Table} from "react-bootstrap";
import {Link} from "react-router-dom";
import {rpcRequest} from "../util";

export class SearchResult extends React.Component<SearchResult.Props, SearchResult.State> {
  constructor(props) {
    super(props);
    this.state = SearchResult.defaultState;
    this.loadResult();
  }

  componentWillReceiveProps() {
    this.loadResult();
  }

  async loadResult() {
    const params = this.props.match.params;
    const result = await rpcRequest("search", params.keyword);
    this.setState({result});
  }

  renderResult() {
    return (
      <Table striped bordered condensed hover>
        <thead>
        <tr>
          <th>Verb</th>
        </tr>
        </thead>
        <tbody>
        {this.state.result.map(([idx, name]) =>
          <tr key={idx}>
            <td>
              <Link to={`/annotate/${idx}`}> {name} </Link>
            </td>
          </tr>
        )}
        </tbody>
      </Table>
    );
  }

  render() {
    const params = this.props.match.params;
    return (
      <Panel header={`Search: ${params.keyword}`}>
        {this.state.result ?
          this.renderResult() :
          <p>Loading...</p>
        }
      </Panel>
    );
  }
}

export namespace SearchResult {
  export interface RouterProps {
    keyword: string;
  }

  export interface Props extends RouteComponentProps<RouterProps> {

  }

  export interface State {
    result?: Array<[number, string]>;
  }

  export const defaultState: State = {};
}
