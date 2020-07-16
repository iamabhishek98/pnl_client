import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { alertMessage } from "./helperFunctions";
import ButtonLoaderContainer from "./buttonLoaderContainer";

class RegisterContainer extends Component {
  constructor() {
    super();
    this.state = {
      title: "Registration Page",
      redirectLogin: false,
      loading: false,
    };
  }

  registerUser(event) {
    const that = this;

    event.preventDefault();

    let data = {
      name: this.refs.name.value,
      email: this.refs.email.value.toLowerCase(),
      password: this.refs.password.value,
    };

    console.log(data);

    if (data.name !== "" && data.email !== "" && data.password !== "") {
      that.setState({
        loading: true,
      });
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
        })
        .finally(() => {
          that.setState({ loading: false });
        });
    } else {
      alertMessage("Please fill up all the required fields!");
    }
  }

  render() {
    let { loading, title } = this.state;
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
        <img className="logo" src="hp_logo.png" alt="HP Logo"></img>
        <br />
        <br />
        <div className="register-form">
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
            <ButtonLoaderContainer
              onButtonSubmit={this.registerUser.bind(this)}
              text="Register"
              color="orange register-button"
              loading={loading}
            />
          </form>
        </div>
        <br />
        <Link to="/">Back to Login</Link>
      </div>
    );
  }
}

export default RegisterContainer;
