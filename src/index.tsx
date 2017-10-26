import * as React from "react";
import "./global.less";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Router, Route, Switch } from "react-router";
import { createHashHistory } from "history";
import { configureStore } from "./redux/store";
import { App } from "./containers";

const store = configureStore();
const history = createHashHistory();

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Switch>
        <Route path="/" component={App} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById("root")
);
