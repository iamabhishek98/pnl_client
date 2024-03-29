import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import "./App.css";
import getParts from "./pages/getParts";
import returnParts from "./pages/returnParts";
import deleteParts from "./pages/deleteParts";
import NotFoundPage from "./pages/404";
import login from "./pages/login";
import logout from "./pages/logout";
import register from "./pages/register";
import uploadParts from "./pages/uploadParts";
import ProtectedRoute from "./protectedRoute";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={login} />
          <Route exact path="/register" component={register} />
          <ProtectedRoute exact path="/home" component={getParts} />
          <ProtectedRoute exact path="/return" component={returnParts} />
          <ProtectedRoute exact path="/delete" component={deleteParts} />
          <ProtectedRoute exact path="/upload" component={uploadParts} />
          <ProtectedRoute exact path="/logout" component={logout} />
          <Route exact path="/404" component={NotFoundPage} />
          <Redirect to="/404" />
        </Switch>
      </Router>
    );
  }
}

export default App;
