import * as React from "react";
import {Button, Form, FormControl, FormGroup, Navbar} from "react-bootstrap";
import {RouteComponentProps} from "react-router";

export class SearchBox extends React.Component<SearchBox.Props, SearchBox.State> {
  private content = "";

  constructor(props) {
    super(props);
  }

  handleSubmit(event) {
    if (this.content) {
      this.props.history.push(`/search/${encodeURI(this.content)}`);
    }
    event.preventDefault();
  }

  render() {
    return (
      <Navbar.Form pullRight>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <FormGroup controlId="formInlineName">
            <FormControl
              type="text"
              placeholder="Keyword"
              width={100}
              onChange={e => {
                const target: any = e.target;
                this.content = target.value
              }}
            />
          </FormGroup>
          <Button type="submit">
            Search
          </Button>
        </form>
      </Navbar.Form>
    );
  }
}

export namespace SearchBox {
  export interface Props {
    history: any;
  }

  export interface State {

  }

}
