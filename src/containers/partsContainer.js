import React, { Component } from "react";
import { Link } from "react-router-dom";
import auth from "../auth";
import { alertMessage, titleCase } from "./helperFunctions";

class PartsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: auth.name,
      available_av: [],
      requested_parts: [],
      parts: undefined,
    };
  }

  // MAKE AJAX CALLS HERE
  componentDidMount() {
    console.log("COMPONENT HAS MOUNTED");

    let that = this;

    fetch("http://localhost:3001/api/get-generic_av")
      .then(function (response) {
        response.json().then(function (data) {
          console.log(data);
          if (data.message.toLowerCase() !== "no generic avs found") {
            let temp_arr = [];
            for (let i = 0; i < data.data.length; i++) {
              temp_arr.push(data.data[i].generic_av);
            }
            that.setState({
              available_av: temp_arr,
            });
            console.log(that.state.available_av);
          } else {
            alertMessage("no available parts left to borrow!");
          }
        });
      })
      .catch(function (err) {
        alertMessage("Server Error!");
        window.location.reload(true);
      });
  }

  resetForms() {
    let getPartsForm = document.getElementById("getPartsForm");
    let detailsForm = document.getElementById("detailsForm");

    if (getPartsForm !== null) getPartsForm.reset();
    if (detailsForm !== null) detailsForm.reset();

    this.setState({
      available_av: [],
      requested_parts: [],
      parts: undefined,
    });
  }

  cancelBorrow() {
    let getPartsForm = document.getElementById("getPartsForm");
    let detailsForm = document.getElementById("detailsForm");

    if (getPartsForm !== null) getPartsForm.reset();
    if (detailsForm !== null) detailsForm.reset();

    this.setState({
      requested_parts: [],
      parts: undefined,
    });
  }

  getParts(event) {
    let that = this;

    event.preventDefault();
    let data = {
      generic_av: this.refs.generic_av.value,
      quantity: this.refs.quantity.value,
    };

    console.log(data);

    if (data.generic_av !== "no generic av" && data.quantity > 0) {
      let request = new Request(
        "http://localhost:3001/api/get-parts",
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
            if (data.message.toLowerCase() === "no parts found") {
              alertMessage("No Available Parts Found for the selected AV!");
              that.resetForms();
            } else {
              let current_specific_av = "";
              let data2 = [];
              for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].specific_av != current_specific_av) {
                  current_specific_av = data.data[i].specific_av;
                  data2.push({
                    specific_av: data.data[i].specific_av,
                    generic_av: data.data[i].generic_av,
                    description: data.data[i].description,
                    level_2_av: "",
                  });
                  data2.push({
                    specific_av: "",
                    generic_av: "",
                    description: "",
                    level_2_av: data.data[i].level_2_av,
                  });
                } else {
                  data2.push({
                    specific_av: "",
                    generic_av: "",
                    description: "",
                    level_2_av: data.data[i].level_2_av,
                  });
                }
              }
              that.setState({
                parts: data2,
                requested_parts: data2,
              });
              console.log("requested_parts", that.state.requested_parts);
            }
          });
        })
        .catch(function (err) {
          alertMessage("Server Error!");
          window.location.reload(true);
        });
    } else {
      alertMessage(
        "Please select one of the available AVs and fill up the quantity field!"
      );
    }
  }

  updatePart(event) {
    let that = this;

    event.preventDefault();
    let data = {
      requested_parts: that.state.requested_parts,
      used: 1,
      requester: that.state.name,
      date_of_request: new Date(),
      customer: this.refs.customer.value,
    };

    console.log(data);

    if (data.requested_parts.length === 0) {
      alertMessage("no available parts left to borrow!");
      that.resetForms();
    } else if (data.customer !== "") {
      let request = new Request(
        "http://localhost:3001/api/update-part",
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
              alertMessage("Parts Borrowed!");
              that.resetForms();
              that.componentDidMount();
            }
          });
        })
        .catch(function (err) {
          alertMessage("Server Error!");
          window.location.reload(true);
        });
    } else {
      alertMessage("Please enter the Customer information!");
    }
  }
  /*renderTableHeader() {
    let header = Object.keys(this.state.students[0])
    return header.map((key, index) => {
       return <th key={index}>{key.toUpperCase()}</th>
    })
 }

 render() {
    return (
       <div>
          <h1 id='title'>React Dynamic Table</h1>
          <table id='students'>
             <tbody>
                <tr>{this.renderTableHeader()}</tr>
                {this.renderTableData()}
             </tbody>
          </table>
       </div>
    )
 }*/
  renderTableData(parts) {
    return parts.map((part, index) => {
      const { specific_av, level_2_av, generic_av, description } = part; //destructuring
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{specific_av}</td>
          <td>{level_2_av}</td>
          <td>{generic_av}</td>
          <td>{description}</td>
        </tr>
      );
    });
  }

  // show loading icon when data is being retrieved
  render() {
    let name = titleCase(this.state.name);
    let available_av = this.state.available_av;
    let parts = this.state.parts;
    return (
      <div className="App">
        <br />
        <h1>
          <b>Hello, {name}!</b>
        </h1>
        <form id="getPartsForm">
          {available_av.length > 0 && (
            <div>
              <select className="input_text getParts_input" ref="generic_av">
                <option value="no generic av">Select Generic AV</option>
                <hr />
                {available_av.map((available_av) => (
                  <option key={available_av} value={available_av}>
                    {available_av}
                  </option>
                ))}
              </select>
              <br />

              <input
                className="input_text getParts_input"
                type="number"
                ref="quantity"
                placeholder="Quantity"
                min="1"
              />
              <br />
              <button
                onClick={this.getParts.bind(this)}
                className="w3-button w3-blue react_button"
              >
                Get Parts
              </button>
            </div>
          )}
        </form>
        {available_av.length === 0 && (
          <div>
            <button
              onClick={this.componentDidMount.bind(this)}
              className="w3-button w3-circle w3-blue react_button"
            >
              Refresh
            </button>
            <br />
          </div>
        )}
        {parts !== undefined && (
          <div>
            <table className="partsTable">
              <tr>
                <th>ID</th>
                <th>Specific AV</th>
                <th>Level 2 AV</th>
                <th>Generic AV</th>
                <th>Description</th>
              </tr>
              {this.renderTableData(parts)}
            </table>

            <br />

            <form id="detailsForm">
              <input
                className="input_text"
                type="text"
                ref="customer"
                placeholder="Customer"
              />
              <br />
              <button
                onClick={this.updatePart.bind(this)}
                className="w3-button w3-blue react_button"
              >
                Borrow Parts
              </button>
              <button
                onClick={this.cancelBorrow.bind(this)}
                className="w3-button w3-light-grey react_button"
              >
                Cancel
              </button>
            </form>
            <br />
          </div>
        )}
        <Link to="/return">
          <button className="w3-button w3-light-grey react_button">
            Return Parts
          </button>
        </Link>
        <Link to="/add">
          <button className="w3-button w3-light-grey react_button">
            Add Parts
          </button>
        </Link>
        <Link to="/delete">
          <button className="w3-button w3-light-grey react_button">
            Delete Parts
          </button>
        </Link>
        <br />
        <Link to="/logout">
          <button className="w3-button w3-red react_button">Logout</button>
        </Link>
      </div>
    );
  }
}

export default PartsContainer;
