import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
// import axios from "axios";
import { CSVReader } from "react-papaparse";
import { alertMessage } from "./helperFunctions";
import auth from "../auth";

class AddPartsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Add Parts",
      name: auth.name,
      csvData: [],
      formattedCSVData: [],
      region: "no region",
      viewContents: false,
      redirectHome: false,
    };
  }

  reset() {
    this.setState({
      csvData: [],
      formattedCSVData: [],
      region: "no region",
      viewContents: false,
    });
  }

  handleOnDrop = (data) => {
    this.setState({
      csvData: data,
      // viewContents: true,
    });
    console.log("add");
  };

  handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
  };

  handleOnRemoveFile = (data) => {
    this.reset();
    console.log("remove");
  };

  csvErrorHandler() {
    let csvData = this.state.csvData;

    if (csvData[0] === undefined) {
      console.log("No File Uploaded");
      return false;
    }

    if (csvData.length === 1) {
      console.log("only one row");
      return false;
    }

    // check empty rows
    let emptyRows = [];
    let numOfColumns = csvData[0].data.length;
    for (let i = 0; i < csvData.length; i++) {
      //   if (csvData[i].errors.length !== 0) {
      //       return false;
      //   }
      let status = false;
      for (let j = 0; j < csvData[i].data.length; j++) {
        if (
          csvData[i].data[j] !== undefined &&
          csvData[i].data[j] !== null &&
          csvData[i].data[j] !== ""
        ) {
          status = true;
          break;
        }
      }
      if (!status) {
        emptyRows.push(i);
      } else if (csvData[i].data.length !== numOfColumns) {
        console.log("number of columns and rows dont tally");
        return false;
      }
    }

    // remove empty rows
    for (let i = emptyRows.length - 1; i >= 0; i--) {
      csvData.splice(emptyRows[i], 1);
    }

    if (csvData.length === 1) {
      console.log("only one row");
      return false;
    }

    let count = 0;

    for (let i = 0; i < csvData[0].data.length; i++) {
      if (
        csvData[0].data[i].toLowerCase() === "types of services requested" ||
        csvData[0].data[i].toLowerCase() === "materialnumber"
      ) {
        count++;
      }
    }

    if (count === 2) return true;

    console.log("required column does not exist");
    return false;
  }

  csvToJSON() {
    let csvData = this.state.csvData;
    let columns = csvData[0].data;
    let result = [];

    for (let i = 1; i < csvData.length; i++) {
      let obj = {};
      let currentline = csvData[i].data;

      for (let j = 0; j < columns.length; j++) {
        if (columns[j].toLowerCase() === "types of services requested") {
          let temp = currentline[j].slice().split("_");
          obj["generic_av"] = temp[0];
          obj["description"] = temp[1];
        } else if (
          columns[j].toLowerCase() === "materialnumber" &&
          currentline[j].length > 2 &&
          currentline[j].slice(-2) === "AV"
        ) {
          obj["specific_av"] = currentline[j];
        }
      }

      if (obj.specific_av !== undefined) {
        result.push(obj);
      }
    }

    return result;
  }

  uploadData(event) {
    event.preventDefault();

    let that = this;
    if (this.csvErrorHandler()) {
      let data = {
        jsonData: this.csvToJSON(),
        name: that.state.name,
        region: this.refs.region.value,
        date_of_upload: new Date(),
      };
      console.log("data", data);

      if (data.region !== "no region") {
        this.setState({
          region: data.region,
        });

        this.renderTableData(false);

        let request = new Request(
          "https://damp-basin-34910.herokuapp.com/api/upload-data",
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
              if (data.status) {
                alertMessage("data inserted successfully!");
                if (
                  window.confirm("Do you want to download the uploaded data?")
                ) {
                  that.exportCsv();
                }
                that.setState({ redirectHome: true });
              } else {
                alertMessage("there were errors with inserting some rows!");
              }
            });
          })
          .catch(function (err) {
            alertMessage("Server Error!");
            window.location.reload(true);
          });
      } else {
        alertMessage("please select one of the available regions!");
      }
    } /*else if (that.state.csvData.length === 0) {
      alertMessage("no file uploaded");
    }*/ else {
      alertMessage("CSV Error Found");
    }
  }

  viewContents(event) {
    event.preventDefault();

    let regionForm = this.refs.region.value;

    console.log(this.state.csvData);

    if (regionForm !== "no region" && this.state.csvData.length !== 0) {
      this.setState({
        region: regionForm,
        viewContents: true,
      });
    } else if (regionForm === "no region") {
      alertMessage("please select one of the available regions!");
    } else if (this.state.csvData.length === 0) {
      alertMessage("No File Uploaded");
    }
  }

  exportCsv() {
    let csv = this.state.formattedCSVData;
    let region = this.state.region;
    console.log("csv", csv);

    let csvRow = [];

    let A = [
      [
        "AV_P/N",
        "AV_P/N_Description",
        "Country_Fulfil",
        "WW_Ref_Price_(2xcost)",
      ],
    ];

    for (let i = 0; i < csv.length; i++) {
      A.push([
        csv[i].specific_av,
        csv[i].description,
        region.toUpperCase(),
        "0.04",
      ]);
    }
    // console.log("A", A[1]);
    for (let i = 0; i < A.length; ++i) {
      csvRow.push(A[i].join(","));
    }

    let csvString = csvRow.join("%0A");

    let a = document.createElement("a");
    a.href = "data:attachment/csv," + csvString;
    a.target = "_Blank";
    a.download = "Uploaded Data.csv";
    document.body.appendChild(a);
    a.click();

    console.warn(csvString);
  }

  renderTableData(renderStatus) {
    if (this.csvErrorHandler()) {
      let jsonData = this.csvToJSON();

      for (let i = 0; i < jsonData.length; i++) {
        jsonData[i].region = this.state.region.toUpperCase();
      }
      this.state.formattedCSVData = jsonData;
      console.log("jsonData", jsonData);

      if (renderStatus) {
        return jsonData.map((part, index) => {
          const { specific_av, description, region } = part; //destructuring
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{specific_av}</td>
              <td>{description}</td>
              <td>{region}</td>
              <td>0.04</td>
            </tr>
          );
        });
      }
    } else {
      this.reset();
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
    let viewContents = this.state.viewContents;
    return (
      <div class="App">
        <br />
        <h1>
          <b>{title}</b>
        </h1>
        <form id="addPartForm">
          <br />
          <select className="input_text" ref="region">
            <option value="no region">Select Region</option>
            <hr />
            <option value="ams">AMS</option>
            <option value="emea">EMEA</option>
            <option value="apj">APJ</option>
          </select>
          <br />
          <br />
          <CSVReader
            onDrop={this.handleOnDrop}
            onError={this.handleOnError}
            addRemoveButton
            onRemoveFile={this.handleOnRemoveFile}
          >
            <span>
              Drop <b>CSV</b> file here or click to upload.
            </span>
          </CSVReader>
          <br />
          {!viewContents && (
            <div>
              <button
                onClick={this.viewContents.bind(this)}
                className="w3-button w3-blue react_button"
              >
                View Contents
              </button>
              <br />
              <button
                onClick={this.uploadData.bind(this)}
                className="w3-button w3-blue react_button"
              >
                Upload
              </button>
            </div>
          )}
          {viewContents && (
            <div>
              <button
                onClick={this.uploadData.bind(this)}
                className="w3-button w3-blue react_button"
              >
                Upload
              </button>
              <br />
              <table className="partsTable">
                <tr>
                  <th>ID</th>
                  <th>AV P/N</th>
                  <th>AV P/N Description</th>
                  <th>Country Fulfil</th>
                  <th>WW Ref Price (2 x cost)</th>
                </tr>
                {this.renderTableData(true)}
              </table>
              <br />
            </div>
          )}
          {/* <br /> */}
        </form>
        {/* {viewContents && (
          <button
            onClick={this.exportCsv.bind(this)}
            className="w3-button w3-blue react_button"
          >
            Export
          </button>
        )} */}
        <Link to="/home">
          <button className="w3-button w3-light-grey react_button">
            Home Page
          </button>
        </Link>
      </div>
    );
  }
}

/*
import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { csv } from "d3";

class AddPartsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Upload CSV",
      file: "",
      fileName: "Choose File",
    };
  }

  fileSelectHandler = (event) => {
    this.setState({
      file: event.target.files[0],
      fileName: event.target.files[0].name,
    });
    console.log("done");
  };

  uploadFile(event) {
    csv("../uploads/test.csv").then((data) => {
      console.log(data);
    });

    let that = this;

    event.preventDefault();
    if (that.state.file !== "") {
      const formData = new FormData();
      formData.append("file", that.state.file);

      axios
        .post("https://damp-basin-34910.herokuapp.com/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
        });
    }
  }

  render() {
    let title = this.state.title;
    return (
      <div className="App">
        <link
          rel="stylesheet"
          href="https://www.w3schools.com/w3css/4/w3.css"
        ></link>
        <h1>
          <b>{title}</b>
        </h1>
        <form>
          <div className="custom-file mb-4">
            <input
              type="file"
              className="custom-file-input"
              id="customFile"
              onChange={this.fileSelectHandler}
            />
            <label className="custom-file-label" htmlFor="customFile">
              {this.state.fileName}
            </label>
          </div>

          <button
            onClick={this.uploadFile.bind(this)}
            className="w3-button w3-black react_button"
          >
            Upload
          </button>
        </form>
        <br />
        <Link to="/home">
          <button className="w3-button w3-black react_button">Main Page</button>
        </Link>
      </div>
    );
  }
}
*/

export default AddPartsContainer;
