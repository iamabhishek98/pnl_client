import React, { Component } from "react";
import { Link } from "react-router-dom";
import auth from "../auth";
import { alertMessage } from "./helperFunctions";
import ButtonLoaderContainer from "./buttonLoaderContainer";

class LoginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Parts Number Library",
      loading: false,
    };
  }

  checkUser(event) {
    const that = this;

    event.preventDefault();

    let data = {
      email: this.refs.email.value.toLowerCase(),
      password: this.refs.password.value,
    };

    console.log(data);

    if (data.email !== "" && data.password !== "") {
      that.setState({
        loading: true,
      });
      let request = new Request(
        `${process.env.REACT_APP_API_URL}api/check-user`,
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
              auth.email = data[0].email;
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
        })
        .finally(() => {
          that.setState({ loading: false });
        });
    } else {
      alertMessage("Please fill up all the required fields!");
    }
  }

  render() {
    let title = this.state.title;
    let loading_login = this.state.loading;
    return (
      <div className="App vertical-center">
        <br />
        <img className="logo" src="hp_logo.png" alt="HP Logo"></img>
        <br />
        <br />
        <div className="login-form">
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
            <ButtonLoaderContainer
              onButtonSubmit={this.checkUser.bind(this)}
              text="LOGIN"
              color="blue login-button"
              loading={loading_login}
            />
          </form>
        </div>
        <br />
        <Link to="/register">Don't have an account? Sign up!</Link>
      </div>
    );
  }
}

export default LoginContainer;
