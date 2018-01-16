import * as React from "react";
import {Button, Form, FormControl, FormGroup} from "react-bootstrap";

export class CommentForm extends React.Component<CommentForm.Props, CommentForm.State> {

  constructor(props) {
    super(props);
    this.state = {value: props.defaultValue};
  }

  componentWillReceiveProps(new_props) {
    this.setState({value: new_props.defaultValue});
  }

  render() {
    return (
      <Form
        horizontal
        onSubmit={e => {
            this.props.onSubmit(this.state.value);
            e.preventDefault();
        }}
      >
        <FormGroup controlId="formControlsTextarea">
          <FormControl
            value={this.state.value || ""}
            componentClass="textarea"
            placeholder="comment"
            onChange={(e) => {
              const target: any = e.target;
              this.setState({value: target.value});
            }}
          />
        </FormGroup>
        <Button type="submit">
          Submit
        </Button>
      </Form>
    );
  }
}

export namespace CommentForm {
  export interface Props {
    onSubmit: any;
    defaultValue: string;
  }

  export interface State {
    value: string;
  }
}
