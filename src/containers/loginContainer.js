import React, { Component } from "react";
import { Link } from "react-router-dom";
import auth from "../auth";
import { alertMessage } from "./helperFunctions";

class LoginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Parts Number Library",
    };
  }

  checkUser(event) {
    let that = this;

    event.preventDefault();

    let data = {
      email: this.refs.email.value.toLowerCase(),
      password: this.refs.password.value,
    };

    console.log(data);

    if (data.email !== "" && data.password !== "") {
      let request = new Request(
        `${process.env.REACT_APP_API_URL}/api/check-user`,
        {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          body: JSON.stringify(data),
        }
      );

      // xmlhttprequest()
      fetch(request, { mode: "cors" })
        .then(function (response) {
          response.json().then(function (data) {
            console.log(data);
            if (data.length === 1) {
              auth.name = data[0].name;
              auth.login(() => {
                that.props.history.push("./home");
              });
              console.log("Valid User", auth.isAuthenticated(), auth.name);
            } else {
              console.log("Invalid User");
              alertMessage("Wrong email or password entered!");
              window.location.reload(true);
            }
          });
        })
        .catch(function (err) {
          console.log(err);
          alertMessage("Server Error!");
          window.location.reload(true);
        });
    } else {
      alertMessage("Please fill up all the required fields!");
    }
  }

  render() {
    let title = this.state.title;
    return (
      <div className="App">
        <br />
        <h1>
          <b>{title}</b>
        </h1>
        <form ref="loginForm">
          <input
            className="input_text"
            type="text"
            ref="email"
            placeholder="Email"
          />
          <br />
          <input
            className="input_text"
            type="password"
            ref="password"
            placeholder="Password"
          />
          <br />
          <button
            onClick={this.checkUser.bind(this)}
            className="w3-button w3-blue react_button"
          >
            Login
          </button>
        </form>
        <Link to="/register">
          <button className="w3-button w3-light-grey react_button">
            Register
          </button>
        </Link>
      </div>
    );
  }
}

export default LoginContainer;
