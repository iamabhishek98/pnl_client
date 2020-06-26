import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import auth from "../auth";
import { alertMessage } from "./helperFunctions";

class ReturnPartsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Return Parts",
      name: auth.name,
      borrowed_av: [],
      redirectHome: false,
    };
  }

  // MAKE AJAX CALLS HERE
  componentDidMount() {
    console.log("COMPONENT HAS MOUNTED");

    let that = this;

    let data = {
      name: that.state.name,
    };

    let request = new Request(
      `${process.env.REACT_APP_API_URL}/api/get-return_av`,
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
          if (data.message.toLowerCase() !== "no specific avs found") {
            let temp_arr = [];
            for (let i = 0; i < data.data.length; i++) {
              temp_arr.push(data.data[i].specific_av);
            }
            that.setState({
              borrowed_av: temp_arr,
            });
            console.log(that.state.borrowed_av);
          } else {
            alertMessage("no borrowed parts to return!");
            that.setState({ redirectHome: true });
          }
        });
      })
      .catch(function (err) {
        alertMessage("Server Error!");
        window.location.reload(true);
      });
  }

  resetForm() {
    let returnPartForm = document.getElementById("returnPartForm");
    if (returnPartForm !== null) returnPartForm.reset();

    this.setState({
      borrowed_av: [],
    });
  }

  returnPart(event) {
    let that = this;

    event.preventDefault();
    let data = {
      specific_av: this.refs.specific_av.value,
      name: auth.name,
      used: 0,
    };

    console.log(data);

    if (data.specific_av !== "no specific av") {
      let request = new Request(
        `${process.env.REACT_APP_API_URL}/api/return-part`,
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
            if (data.message.toLowerCase() === "data updated") {
              alertMessage("Part Returned!");
            } else {
              alertMessage(
                "Part Not Returned! Make sure you selected the specific av of a borrowed part!"
              );
            }
            that.resetForm();
            that.componentDidMount();
          });
        })
        .catch(function (err) {
          alertMessage("Server Error!");
          window.location.reload(true);
        });
    } else {
      alertMessage("Please select one of the borrowed avs to return!");
    }
  }

  render() {
    if (this.state.redirectHome) {
      return (
        <Redirect
          to={{
            pathname: "/home",
          }}
        />
      );
    }

    let title = this.state.title;
    let borrowed_av = this.state.borrowed_av;
    return (
      <div className="App">
        <br />
        <h1>
          <b>{title}</b>
        </h1>
        {borrowed_av.length > 0 && (
          <form id="returnPartForm">
            <select className="input_text" ref="specific_av">
              <option value="no specific av">Select Borrowed AV</option>
              <hr />
              {borrowed_av.map((borrowed_av) => (
                <option key={borrowed_av} value={borrowed_av}>
                  {borrowed_av}
                </option>
              ))}
            </select>
            <br />
            <button
              onClick={this.returnPart.bind(this)}
              className="w3-button w3-blue react_button"
            >
              Return
            </button>
          </form>
        )}
        <Link to="/home">
          <button className="w3-button w3-light-grey react_button">
            Home Page
          </button>
        </Link>
      </div>
    );
  }
}

export default ReturnPartsContainer;
