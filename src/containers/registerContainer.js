import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { alertMessage } from "./helperFunctions";

class RegisterContainer extends Component {
  constructor() {
    super();
    this.state = {
      title: "Registration Page",
      redirectLogin: false,
    };
  }

  registerUser(event) {
    let that = this;

    event.preventDefault();

    let data = {
      name: this.refs.name.value,
      email: this.refs.email.value.toLowerCase(),
      password: this.refs.password.value,
    };

    console.log(data);

    if (data.name !== "" && data.email !== "" && data.password !== "") {
      let request = new Request(
        `${process.env.REACT_APP_API_URL}api/register-user`,
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
            if (
              data.message.toLowerCase() === "not valid hp user" ||
              data.message.toLowerCase() === "unable to register user"
            ) {
              alertMessage(data.message + "!");
            } else {
              alertMessage("Registration Successful!");
              that.setState({
                redirectLogin: true,
              });
            }
            window.location.reload(true);
          });
        })
        .catch(function (err) {
          alertMessage("Server Error!");
          window.location.reload(true);
        });
    } else {
      alertMessage("Please fill up all the required fields!");
    }
  }

  render() {
    let title = this.state.title;
    if (this.state.redirectLogin) {
      return (
        <Redirect
          to={{
            pathname: "/",
          }}
        />
      );
    }
    return (
      <div className="App">
        <br />
        <h1>
          <b>{title}</b>
        </h1>
        <form ref="registrationForm">
          <input
            className="input_text"
            type="text"
            ref="name"
            placeholder="Name"
          />
          <br />
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
          <text style={{ color: "black" }}>*Do not use HP password</text>
          <br />
          <button
            onClick={this.registerUser.bind(this)}
            className="w3-button w3-round w3-blue react_button"
          >
            Register
          </button>
        </form>
        <Link to="/">Back to Login</Link>
      </div>
    );
  }
}

export default RegisterContainer;
