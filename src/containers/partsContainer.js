import React, { Component } from "react";
import { Link } from "react-router-dom";
import auth from "../auth";
import { alertMessage, titleCase } from "./helperFunctions";

class PartsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: auth.name,
      all_av: [],
      all_av_filtered: [],
      all_av_status: false,
      available_av: [],
      av_regions: [],
      av_regions_status: false,
      av_components: [],
      av_components_status: false,
      requested_parts: [],
      parts: undefined,
      lvl2_parts: undefined,
      lvl2_status: true,
    };
  }

  // MAKE AJAX CALLS HERE
  componentDidMount() {
    console.log("COMPONENT HAS MOUNTED");

    let that = this;

    fetch(`${process.env.REACT_APP_API_URL}api/get-generic_av`)
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
      all_av: [],
      all_av_filtered: [],
      available_av: [],
      av_regions: [],
      av_regions_status: false,
      av_components_status: [],
      av_components_status: false,
      requested_parts: [],
      parts: undefined,
      lvl2_parts: undefined,
    });
  }

  cancelBorrow() {
    let getPartsForm = document.getElementById("getPartsForm");
    let detailsForm = document.getElementById("detailsForm");

    if (getPartsForm !== null) getPartsForm.reset();
    if (detailsForm !== null) detailsForm.reset();

    this.setState({
      av_regions: [],
      av_regions_status: false,
      av_components_status: [],
      av_components_status: false,
      requested_parts: [],
      parts: undefined,
      lvl2_parts: undefined,
    });
  }

  toggleDisplayParts() {
    this.setState({
      lvl2_status: !this.state.lvl2_status,
    });
  }

  getRegions(event) {
    let that = this;
    event.preventDefault();

    // av only for testing purposes (to be changed to AY104AV )

    let data = {
      generic_av: this.refs.generic_av.value,
    };

    let request = new Request(
      `${process.env.REACT_APP_API_URL}api/get-regions`,

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
          if (data.message.toLowerCase() === "regions found") {
            console.log(data);
            that.setState({
              av_regions: data.data,
              av_regions_status: true,
            });
            console.log(that.state);
          }
        });
      })
      .catch(function (err) {
        alertMessage("Server Error!");
        window.location.reload(true);
      });
  }

  getComponents(event) {
    let that = this;
    event.preventDefault();

    // av only for testing purposes (to be changed to AY104AV )
    if (this.refs.generic_av.value === "AY104AV") {
      let data = {
        generic_av: this.refs.generic_av.value,
      };

      if (this.refs.av_regions && this.refs.av_regions.value !== "no region") {
        data.region = this.refs.av_regions.value;
      } else {
        data.region = "";
      }

      let request = new Request(
        `${process.env.REACT_APP_API_URL}api/get-components`,

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
            if (data.message.toLowerCase() === "components found") {
              console.log(data);
              that.setState({
                av_components: data.data,
                av_components_status: true,
              });
            }
          });
        })
        .catch(function (err) {
          alertMessage("Server Error!");
          window.location.reload(true);
        });
    }
  }

  getFields(event) {
    this.getRegions(event);
    this.getComponents(event);
  }

  getParts(event) {
    let that = this;

    event.preventDefault();

    let av_components = "";
    if (this.refs.av_components && this.refs.av_components.value) {
      av_components = this.refs.av_components.value;
    }

    let data = {
      generic_av: this.refs.generic_av.value,
      quantity: this.refs.quantity.value,
      region: this.refs.av_regions.value,
      components: av_components,
    };

    if (
      data.generic_av !== "no generic av" &&
      data.quantity > 0 &&
      data.region !== "no region" &&
      (data.components === "" || data.components !== "no component")
    ) {
      let request = new Request(
        `${process.env.REACT_APP_API_URL}api/get-parts`,

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
              console.log(data.data);
              let current_specific_av = "";

              let distinct_av_data = JSON.parse(JSON.stringify(data.data));
              for (let i = 0; i < distinct_av_data.length; i++) {
                delete distinct_av_data[i].lvl2_av;
              }

              distinct_av_data = distinct_av_data.filter(
                (data, index, self) =>
                  index ===
                  self.findIndex(
                    (t) =>
                      t.specific_av === data.specific_av &&
                      t.generic_av === data.generic_av &&
                      t.description === data.description
                  )
              );

              // let av_lvl2_data = [];
              // for (let i = 0; i < data.data.length; i++) {
              //   if (data.data[i].specific_av !== current_specific_av) {
              //     current_specific_av = data.data[i].specific_av;
              //     av_lvl2_data.push({
              //       specific_av: data.data[i].specific_av,
              //       generic_av: data.data[i].generic_av,
              //       description: data.data[i].description,
              //       level_2_av: "",
              //     });
              //     av_lvl2_data.push({
              //       specific_av: "",
              //       generic_av: "",
              //       description: "",
              //       level_2_av: data.data[i].level_2_av,
              //     });
              //   } else {
              //     av_lvl2_data.push({
              //       specific_av: "",
              //       generic_av: "",
              //       description: "",
              //       level_2_av: data.data[i].level_2_av,
              //     });
              //   }
              // }
              let av_lvl2_data = [];
              let empty_obj = {
                specific_av: "",
                generic_av: "",
                description: "",
                level_2_av: "",
              };
              let temp_obj = { ...empty_obj };
              for (let i = 0; i < data.data.length; i++) {
                if (data.data[i].specific_av !== current_specific_av) {
                  // console.log(temp_obj)
                  if (JSON.stringify(temp_obj) !== JSON.stringify(empty_obj))
                    av_lvl2_data.push(temp_obj);
                  current_specific_av = data.data[i].specific_av;
                  temp_obj = {
                    specific_av: data.data[i].specific_av,
                    generic_av: data.data[i].generic_av,
                    description: data.data[i].description,
                    level_2_av: data.data[i].level_2_av,
                  };
                } else {
                  temp_obj.level_2_av += "; " + data.data[i].level_2_av;
                }
              }
              if (JSON.stringify(temp_obj) !== JSON.stringify(empty_obj))
                av_lvl2_data.push(temp_obj);

              that.setState({
                parts: distinct_av_data,
                lvl2_parts: av_lvl2_data,
                requested_parts: distinct_av_data,
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
      alertMessage("Please fill up the required fields!");
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
        `${process.env.REACT_APP_API_URL}api/update-part`,
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

  exportCsv(event) {
    if (this.state.lvl2_status) {
      let csv = this.state.parts;

      let csvRow = [];

      let A = [["Specific%20AV", "Generic%20AV", "Description"]];

      for (let i = 0; i < csv.length; i++) {
        A.push([csv[i].specific_av, csv[i].generic_av, csv[i].description]);
      }

      for (let i = 0; i < A.length; ++i) {
        csvRow.push(A[i].join(",").split(" ").join("%20"));
      }

      let csvString = csvRow.join("%0A");

      let a = document.createElement("a");
      a.href = "data:attachment/csv," + csvString;
      a.target = "_Blank";
      a.download = "Retrieved Data.csv";
      document.body.appendChild(a);
      a.click();

      console.warn(csvString);
    } else {
      let csv = this.state.lvl2_parts;

      let csvRow = [];

      let A = [
        ["Specific%20AV", "BOM%20Components", "Generic%20AV", "Description"],
      ];

      for (let i = 0; i < csv.length; i++) {
        A.push([
          csv[i].specific_av,
          csv[i].level_2_av,
          csv[i].generic_av,
          csv[i].description,
        ]);
      }

      for (let i = 0; i < A.length; ++i) {
        csvRow.push(A[i].join(",").split(" ").join("%20"));
      }

      let csvString = csvRow.join("%0A");

      let a = document.createElement("a");
      a.href = "data:attachment/csv," + csvString;
      a.target = "_Blank";
      a.download = "Retrieved Data.csv";
      document.body.appendChild(a);
      a.click();

      console.warn(csvString);
    }
  }

  allData(event) {
    let that = this;

    that.setState({ all_av_status: !that.state.all_av_status });

    fetch(`${process.env.REACT_APP_API_URL}api/get-all_generic_av`)
      .then(function (response) {
        response.json().then(function (data) {
          console.log(data);
          if (data.message.toLowerCase() !== "no generic avs found") {
            that.setState({
              all_av: data.data,
              all_av_filtered: data.data,
            });
            console.log(data.data);
          } else {
            alertMessage("no generic avs found!");
          }
        });
      })
      .catch(function (err) {
        alertMessage("Server Error!");
        window.location.reload(true);
      });
  }

  filterBuffer(event) {
    event.preventDefault();
    let filter_region = this.refs.buffer_region.value;
    // console.log(this.state.all_av);
    if (filter_region !== "no region") {
      let data = [];
      for (let i = 0; i < this.state.all_av.length; i++) {
        if (this.state.all_av[i].region === filter_region) {
          data.push(this.state.all_av[i]);
        }
      }
      this.setState({ all_av_filtered: data });
    } else {
      this.setState({ all_av_filtered: this.state.all_av });
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
  renderTableDistinctData(parts) {
    return parts.map((part, index) => {
      const { specific_av, generic_av, description } = part; //destructuring
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{specific_av}</td>
          <td>{generic_av}</td>
          <td>{description}</td>
        </tr>
      );
    });
  }

  renderTableLvl2Data(parts) {
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

  renderTableAllData(parts) {
    return parts.map((part, index) => {
      const { generic_av, region, quantity } = part; //destructuring
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{generic_av}</td>
          <td>{region.toUpperCase()}</td>
          <td>{quantity}</td>
        </tr>
      );
    });
  }

  // show loading icon when data is being retrieved
  render() {
    let name = titleCase(this.state.name);
    let available_av = this.state.available_av;
    let parts = undefined;
    if (this.state.lvl2_status) {
      parts = this.state.parts;
    } else {
      parts = this.state.lvl2_parts;
    }

    let av_regions = this.state.av_regions;
    let av_regions_status = this.state.av_regions_status;

    let av_components = this.state.av_components;
    let av_components_status = this.state.av_components_status;

    let all_parts = this.state.all_av_filtered;
    let all_parts_status = this.state.all_av_status;

    return (
      <div className="App">
        <br />
        <h1>
          <b>Hello, {name}!</b>
        </h1>
        <Link to="/logout">
          <button className="w3-button w3-round w3-red react_button">
            Logout
          </button>
        </Link>
        <br />
        <br />
        <form id="getPartsForm">
          {available_av.length > 0 && (
            <div>
              <select
                onChange={this.getFields.bind(this)}
                className="input_text getParts_input"
                ref="generic_av"
              >
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
              {av_regions_status && (
                <select
                  onChange={this.getComponents.bind(this)}
                  className="input_text getParts_input"
                  ref="av_regions"
                >
                  <option value="no region">Select Region</option>
                  <hr />
                  {av_regions.map((av_regions) => (
                    <option key={av_regions.region} value={av_regions.region}>
                      {av_regions.region.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}
              {av_regions_status && <br />}
              {av_components_status && (
                <select
                  className="input_text getParts_input"
                  ref="av_components"
                >
                  <option value="no component">Select Component</option>
                  <hr />
                  {av_components.map((av_components) => (
                    <option
                      key={av_components.components}
                      value={av_components.components}
                    >
                      {av_components.components}
                    </option>
                  ))}
                </select>
              )}
              {av_components_status && <br />}
              <button
                onClick={this.getParts.bind(this)}
                className="w3-button w3-round w3-blue react_button"
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
            {this.state.lvl2_status && (
              <div>
                <button
                  onClick={this.toggleDisplayParts.bind(this)}
                  className="w3-button w3-round w3-light-grey react_button"
                >
                  View BOM Components
                </button>
                <button
                  onClick={this.exportCsv.bind(this)}
                  className="w3-button w3-round w3-light-grey react_button"
                >
                  Download Table
                </button>
                <table className="partsTable">
                  <tr>
                    <th>ID</th>
                    <th>Specific AV</th>
                    <th>Generic AV</th>
                    <th>Description</th>
                  </tr>
                  {this.renderTableDistinctData(parts)}
                </table>
              </div>
            )}
            {!this.state.lvl2_status && (
              <div>
                <button
                  onClick={this.toggleDisplayParts.bind(this)}
                  className="w3-button w3-round w3-light-grey react_button"
                >
                  Hide BOM Components
                </button>
                <button
                  onClick={this.exportCsv.bind(this)}
                  className="w3-button w3-round w3-light-grey react_button"
                >
                  Download Table
                </button>

                <table className="partsTable">
                  <tr>
                    <th>ID</th>
                    <th>Specific AV</th>
                    <th>BOM Components</th>
                    <th>Generic AV</th>
                    <th>Description</th>
                  </tr>
                  {this.renderTableLvl2Data(parts)}
                </table>
              </div>
            )}

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
                className="w3-button w3-round w3-blue react_button"
              >
                Borrow Parts
              </button>
              <button
                onClick={this.cancelBorrow.bind(this)}
                className="w3-button w3-round w3-light-grey react_button"
              >
                Cancel
              </button>
            </form>
            <br />
          </div>
        )}
        <Link to="/return">
          <button className="w3-button w3-round w3-light-grey react_button">
            Return Parts
          </button>
        </Link>
        <Link to="/add">
          <button className="w3-button w3-round w3-light-grey react_button">
            Upload Parts
          </button>
        </Link>
        <Link to="/delete">
          <button className="w3-button w3-round w3-light-grey react_button">
            Delete Parts
          </button>
        </Link>

        <br />
        {!all_parts_status && (
          <button
            onClick={this.allData.bind(this)}
            className="w3-button w3-round w3-light-grey react_button"
          >
            View Buffer
          </button>
        )}
        {all_parts_status && (
          <div>
            <button
              onClick={this.allData.bind(this)}
              className="w3-button w3-round w3-light-grey react_button"
            >
              Hide Buffer
            </button>
            <br />
            <select
              onChange={this.filterBuffer.bind(this)}
              className="input_text getParts_input"
              ref="buffer_region"
            >
              <option value="no region">All Regions</option>
              <hr />
              <option value="ams">AMS</option>
              <option value="apj">APJ</option>
              <option value="emea">EMEA</option>
            </select>
            <br />
            <table className="partsTable">
              <tr>
                <th>ID</th>
                <th>Generic AV</th>
                <th>Region</th>
                <th>Quantity</th>
              </tr>
              {this.renderTableAllData(all_parts)}
            </table>
          </div>
        )}
        <br />
      </div>
    );
  }
}

export default PartsContainer;
