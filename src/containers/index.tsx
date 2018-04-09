import * as React from "react";
import * as Actions from "../redux/actions";
import * as Style from "./style.scoped.less";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {Route, RouteComponentProps, Router, Switch} from "react-router";
import {RootState} from "../redux/reducers";
import {Navbar, Nav, NavItem, Panel, Form, FormGroup, ControlLabel, FormControl, Button} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Link} from "react-router-dom";
import {PropbankAnnotation} from "./propbank-annotation";
import * as store from "store";
import {SearchResult} from "./search_result";
import {SearchBox} from "./searchbox";
import {XHAnnotation} from "./xh-annotation";

export namespace App {
  export interface Props extends RouteComponentProps<void> {
    username: string;
  }

  export interface State {
    /* empty */
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export class App extends React.Component<App.Props, App.State> {
  changeUserName() {
    const name = window.prompt("What's your name?");
    store.set("username", name);
    window.location.reload();
  }

  render() {
    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="./">Example</Link>
            </Navbar.Brand>
          </Navbar.Header>
          <Nav>
            <LinkContainer exact to="/">
              <NavItem eventKey={1}>Main</NavItem>
            </LinkContainer>
            <LinkContainer to="/about">
              <NavItem eventKey={2}>About</NavItem>
            </LinkContainer>
          </Nav>
          <Nav pullRight>
            <SearchBox history={this.props.history}/>
            <NavItem> <a onClick={this.changeUserName}>{this.props.username}</a> </NavItem>
          </Nav>
        </Navbar>
        <div className={Style.container}>
          <Router history={this.props.history}>
            <Switch>
              <Route exact path="/" render={App.renderMain}/>
              <Route
                path="/annotate/:no"
                component={PropbankAnnotation}
              />
              <Route
                path="/xh-annotate/:no"
                component={XHAnnotation}
              />
              <Route
                path="/search/:keyword"
                component={SearchResult}
              />
            </Switch>
          </Router>
        </div>
        <div className={Style.footer}>
          <p>Version: 0.1</p>
        </div>
      </div>
    );
  }

  static renderMain() {
    return (
      <Panel>
        Testing...
      </Panel>
    );
  }

  static renderAbout() {
    return (
      <Panel>
        About...
      </Panel>
    );
  }
}

function mapStateToProps(state: RootState) {
  return {
    username: state.GlobalInfo.username
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions as any, dispatch)
  };
}
