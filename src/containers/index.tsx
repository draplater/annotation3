import * as React from "react";
import * as Actions from "../redux/actions";
import * as Style from "./style.scoped.less";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {Route, RouteComponentProps, Router, Switch} from "react-router";
import {RootState} from "../redux/reducers";
import {Navbar, Nav, NavItem, Panel} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Link} from "react-router-dom";

export namespace App {
  export interface Props extends RouteComponentProps<void> {
    version: number;
  }

  export interface State {
    /* empty */
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export class App extends React.Component<App.Props, App.State> {
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
        </Navbar>
        <div className={Style.container}>
          <Router history={this.props.history}>
            <Switch>
              <Route exact path="/" render={App.renderMain}/>
              <Route path="/about" render={App.renderAbout}/>
            </Switch>
          </Router>
        </div>
        <div className={Style.footer}>
          <p>Version: {this.props.version}</p>
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
    version: state.VersionInfo.version
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions as any, dispatch)
  };
}
