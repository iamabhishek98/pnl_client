import React, { Component } from "react";
import { Link } from "react-router-dom";
import auth from "../auth";

class LogoutContainer extends Component {
  render() {
    return (
      <main className="container">
        <div className="App">
          <br />
          <h1>
            <b>Are you sure you want to logout?</b>
          </h1>
          <button
            className="w3-button w3-round w3-red react_button"
            onClick={() => {
              auth.logout(() => {
                // put if statement here
                this.props.history.push("./");
              });
              console.log("logout", auth.isAuthenticated());
            }}
          >
            Yes
          </button>
          <Link to="/home">
            <button className="w3-button w3-round w3-light-grey react_button">
              No
            </button>
          </Link>
        </div>
      </main>
    );
  }
}

export default LogoutContainer;
