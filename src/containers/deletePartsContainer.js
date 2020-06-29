import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { alertMessage } from "./helperFunctions";
import auth from "../auth";

class DeletePartsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Delete Parts",
      name: auth.name,
      owned_av: [],
      requested_part: undefined,
      redirectHome: false,
    };
    // this.requested_part = undefined;
  }

  // MAKE AJAX CALLS HERE
  componentDidMount() {
    console.log("COMPONENT HAS MOUNTED");

    let that = this;

    let data = {
      name: that.state.name,
    };

    let request = new Request(
      `${process.env.REACT_APP_API_URL}api/get-delete_av`,
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
              owned_av: temp_arr,
            });
            console.log(that.state.owned_av);
          } else {
            alertMessage("no parts found under your name!");
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
    let getPartForm = document.getElementById("getPartForm");
    if (getPartForm !== null) getPartForm.reset();

    this.setState({
      owned_av: [],
    });
  }
  /*
  getPart(event) {
    let that = this;

    that.setState({ requested_part: undefined });

    event.preventDefault();
    let data = {
      av: this.refs.av.value,
    };

    console.log(data);

    if (data.av !== "") {
      let request = new Request(`${process.env.REACT_APP_API_URL}api/get-part`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
      });

      // xmlhttprequest()
      fetch(request, { mode: "cors" })
        .then(function (response) {
          response.json().then(function (data) {
            if (data.length !== 0) {
              that.setState({
                owned_av: data,
                requested_part: data,
              });
              console.log("requested_part", that.state.requested_part);
            } else {
              // that.setState({
              //   owned_av: data,
              //   requested_part: undefined,
              // });
              alertMessage("part not found!");
              that.resetForm();
            }
          });
        })
        .catch(function (err) {
          alertMessage("Server Error!");
          window.location.reload(true);
        });
    } else {
      alertMessage("No data entered!");
    }
  }
*/
  deletePart(event) {
    let that = this;

    event.preventDefault();
    let data = {
      specific_av: that.refs.specific_av.value,
      name: that.state.name,
    };

    if (data.specific_av !== "no specific av") {
      let request = new Request(
        `${process.env.REACT_APP_API_URL}api/delete-part`,
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
            if (data.message.toLowerCase() === "data deleted") {
              alertMessage("Part Deleted!");
            } else {
              alertMessage(
                "Part Not Deleted! Make sure you selected the specific av !"
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
      alertMessage("Please select one of the specific avs to delete!");
    }
  }
  /*
  cancelPart(event) {
    this.setState({
      requested_part: undefined,
    });

    console.log(this.state.requested_part);
  }
  */
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
    let owned_av = this.state.owned_av;
    // let requested_part = this.state.requested_part;
    return (
      <div className="App">
        <br />
        <h1>
          <b>{title}</b>
        </h1>
        {owned_av.length > 0 && (
          <form id="deletePartForm">
            <select className="input_text" ref="specific_av">
              <option value="no specific av">Select Specific AV</option>
              <hr />
              {owned_av.map((owned_av) => (
                <option key={owned_av} value={owned_av}>
                  {owned_av}
                </option>
              ))}
            </select>
            <br />
            <button
              onClick={this.deletePart.bind(this)}
              className="w3-button w3-round w3-red react_button"
            >
              Delete
            </button>
          </form>
        )}

        {/* <form id="getPartForm">
          <input className="input_text" type="text" ref="av" placeholder="AV" />
          <br />
          <button
            onClick={this.getPart.bind(this)}
            className="w3-button w3-round w3-blue react_button"
          >
            Get Part
          </button>
        </form>
        {parts !== undefined && requested_part !== undefined && (
          <div>
            <ul className="unordered_list">
              <h2>Retrieved Part</h2>
              {parts.map((parts) => (
                <li key={parts.av}>
                  <b>AV:</b> {parts.av}, <b>Service AV:</b> {parts.service_av},{" "}
                  <b>Description:</b> {parts.description}
                </li>
              ))}
            </ul>
            <button
              onClick={this.deletePart.bind(this)}
              className="w3-button w3-round w3-red react_button"
            >
              Delete
            </button>
            <button
              onClick={this.cancelPart.bind(this)}
              className="w3-button w3-round w3-light-grey react_button"
            >
              Cancel
            </button>
          </div>
        )} */}
        <Link to="/home">
          <button className="w3-button w3-round w3-light-grey react_button">
            Home Page
          </button>
        </Link>
      </div>
    );
  }
}

export default DeletePartsContainer;
