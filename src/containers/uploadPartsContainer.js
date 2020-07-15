import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
// import axios from "axios";
import { CSVReader } from "react-papaparse";
import { alertMessage, titleCase } from "./helperFunctions";
import auth from "../auth";
import ButtonLoaderContainer from "./buttonLoaderContainer";

class UploadPartsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Upload Parts",
      name: auth.name,
      email: auth.email,
      csvData: [],
      formattedCSVData: [],
      region: "no region",
      viewContents: false,
      redirectHome: false,
      loading_email: false,
      loading_upload: false,
    };
  }

  componentDidMount() {
    console.log("COMPONENT HAS MOUNTED");
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
    let csvResult = [];

    // array = ["av","av",1,2,3,"av",4,5]
    // array2 = []
    // temp_obj = {av:"",lvl2:[]}
    // empty_obj = {av:"",lvl2:[]}

    // for (let i =0; i < array.length;i++) {
    //   console.log(array2)
    //   if (array[i] === "av") {
    //     if (JSON.stringify(temp_obj) != JSON.stringify(empty_obj)) array2.push(temp_obj)
    //     temp_obj = {av:"",lvl2:[]}
    //     temp_obj.av = array[i]
    //   } else {
    //     temp_obj.lvl2.push(array[i])
    //   }
    // }
    // array2.push(temp_obj)

    // console.log(array2)

    for (let i = 1; i < csvData.length; i++) {
      let obj = {};
      let currentline = csvData[i].data;

      for (let j = 0; j < columns.length; j++) {
        if (columns[j].toLowerCase() === "types of services requested") {
          let temp = currentline[j].slice().split("_");
          obj["generic_av"] = temp[0];
          obj["bom"] = temp[1].toLowerCase() === "bom" ? 1 : 0;
          if (temp[2]) {
            obj["components"] = temp.slice(2).join("_");
          }
        } else if (columns[j].toLowerCase() === "description") {
          obj["description"] = currentline[j];
        } else if (
          columns[j].toLowerCase() === "materialnumber" &&
          currentline[j].length > 2
          // &&
          // currentline[j].slice(-2) === "AV"
        ) {
          obj["specific_av"] = currentline[j];
        }
      }

      if (!obj.components) {
        obj.components = "";
      }

      if (obj.specific_av !== undefined) {
        csvResult.push(obj);
      }
    }

    let result = [];

    let empty_obj = {
      specific_av: "",
      generic_av: "",
      bom: "",
      components: "",
      description: "",
      level_2_av: [],
    };
    // shallow copy
    let temp_obj = { ...empty_obj };

    for (let i = 0; i < csvResult.length; i++) {
      if (csvResult[i].specific_av.slice(-2) === "AV") {
        if (JSON.stringify(temp_obj) !== JSON.stringify(empty_obj))
          result.push(temp_obj);
        // deep copy
        temp_obj = JSON.parse(JSON.stringify(empty_obj));
        temp_obj.specific_av = csvResult[i].specific_av;
        temp_obj.generic_av = csvResult[i].generic_av;
        temp_obj.description = csvResult[i].description;
        temp_obj.bom = csvResult[i].bom;
        temp_obj.components = csvResult[i].components;
      } else {
        temp_obj.level_2_av.push(csvResult[i].specific_av);
      }
    }

    result.push(temp_obj);

    return result;
  }

  uploadData(event) {
    event.preventDefault();

    const that = this;
    if (this.csvErrorHandler()) {
      let data = {
        jsonData: this.csvToJSON(),
        name: that.state.name,
        region: this.refs.region.value,
        date_of_upload: new Date(),
      };

      // console.log("data", data);

      if (data.region !== "no region") {
        this.setState({
          region: data.region,
        });

        this.renderTableData(false);

        if (window.confirm("Are you sure you want to upload the data?")) {
          that.setState({
            loading_upload: true,
          });
          let request = new Request(
            `${process.env.REACT_APP_API_URL}api/upload-data`,
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
                  that.sendIcost();
                  that.setState({ redirectHome: true });
                } else {
                  alertMessage("unable to upload data!");
                }
              });
            })
            .catch(function (err) {
              alertMessage("Server Error!");
              window.location.reload(true);
            })
            .finally(() => {
              that.setState({ loading_upload: false });
            });
        }
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

  // not being used currently
  exportCsv() {
    let csv = this.state.formattedCSVData;

    let csvRow = [];

    let A = [
      [
        "Part%20Number",
        "Description",
        "Cost",
        "Make/Buy%20Flag",
        "Plant%20Code",
      ],
    ];

    for (let i = 0; i < csv.length; i++) {
      A.push([
        csv[i].specific_av,
        csv[i].description,
        "$0.02",
        "BUY",
        "%810905",
      ]);
    }

    for (let i = 0; i < A.length; ++i) {
      csvRow.push(A[i].join(",").split(" ").join("%20"));
    }

    let csvString = csvRow.join("%0A");

    let a = document.createElement("a");
    a.href = "data:attachment/csv," + csvString;
    a.target = "_Blank";
    a.download = "Cost Upload Form.csv";
    document.body.appendChild(a);
    a.click();
  }

  sendIcost() {
    const that = this;

    let formattedCSVData = that.state.formattedCSVData;

    let data = [];
    for (let i = 0; i < formattedCSVData.length; i++) {
      let temp = {};
      temp["Part Number"] = formattedCSVData[i].specific_av;
      temp.Description = formattedCSVData[i].description;
      temp.Cost = "$0.02";
      temp["Make/Buy Flag"] = "BUY";
      temp["Plant Code"] = "0905";
      data.push(temp);
    }

    let current_date = new Date();

    const emailData = {
      user: that.state.email,
      subject: `Parts Uploaded Sucessfully on ${current_date.toDateString()} by ${titleCase(
        that.state.name
      )}`,
      data: data,
      attachment: "iCost Template",
    };

    let request = new Request(
      `${process.env.REACT_APP_API_URL}api/email-upload`,

      {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(emailData),
      }
    );

    // xmlhttprequest()
    fetch(request, { mode: "cors" })
      .then(function (response) {
        response.json().then(function (data) {
          if (data.message.toLowerCase() === "email sent") {
            console.log("Email Sent!");
          } else {
            console.log("unable to send email!");
          }
        });
      })
      .catch(function (err) {
        alertMessage("Server Error!");
        window.location.reload(true);
      });
  }

  sendTemplate(event) {
    const that = this;

    event.preventDefault();

    that.setState({
      loading_email: true,
    });

    let formattedCSVData = that.state.formattedCSVData;

    let data = [];
    for (let i = 0; i < formattedCSVData.length; i++) {
      let temp = {};
      temp["Generic AV"] = formattedCSVData[i].generic_av;
      temp["Specific AV"] = formattedCSVData[i].specific_av;
      temp.Description = formattedCSVData[i].description;
      temp.Region = formattedCSVData[i].region;
      temp.Price = "$0.04";
      data.push(temp);
    }

    let to = "";
    let cc = "";
    let subject = "";
    let body = "";
    if (that.state.region === "apj") {
      to = "PDLMARKETINGOPS@hp.com;";
      cc = "paliwal@hp.com; Annie.Leong@hp.com;";
      subject = "Setup Patsy, PLC, ILP (buffer CS AVs)";
      body = `<p>Hi Team,<br/><br/>
              Please help to setup PATSY, PLC & ILP for APJ countries and inform once done.</p>`;
    } else {
      to = "pdm_coe_pricing@hp.com; regionalpricing1@hp.com;";
      cc = "gbs-pccs-hw-engr-team1@hp.com;";
      subject = "CS AV Phweb and GPys Description update – Priority";
      body = `<p>Hi Team,<br/><br/>
              Request to update Phweb and GPSy for below AV’s:</p>`;
    }

    const emailData = {
      user: that.state.email,
      to: to,
      cc: cc,
      subject: subject,
      body: body,
      data: data,
    };

    let request = new Request(
      `${process.env.REACT_APP_API_URL}api/email-upload`,

      {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(emailData),
      }
    );

    // xmlhttprequest()
    fetch(request, { mode: "cors" })
      .then(function (response) {
        response.json().then(function (data) {
          if (data.message.toLowerCase() === "email sent") {
            console.log(data);
            alertMessage("Email Sent!");
          } else {
            alertMessage("unable to send email!");
          }
        });
      })
      .catch(function (err) {
        alertMessage("Server Error!");
        window.location.reload(true);
      })
      .finally(() => {
        that.setState({ loading_email: false });
      });
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
          const { specific_av, generic_av, description, region } = part; //destructuring
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{generic_av}</td>
              <td>{specific_av}</td>
              <td>{description}</td>
              <td>{region}</td>
              <td>$0.04</td>
            </tr>
          );
        });
      }
    } else {
      this.reset();
    }
  }

  openMailApp(event) {
    const that = this;

    event.preventDefault();

    let to = "";
    let cc = "";
    let subject = "";
    let body = "";
    if (that.state.region === "apj") {
      to = "PDLMARKETINGOPS@hp.com;";
      cc = "paliwal@hp.com, Annie.Leong@hp.com";
      subject = "Setup Patsy, PLC, ILP (buffer CS AVs)";
      body = `Hi Team,%0d%0a%0d%0aPlease help to setup PATSY, PLC & ILP for APJ countries and inform once done.%0d%0a`;
    } else {
      to = "pdm_coe_pricing@hp.com, regionalpricing1@hp.com;";
      cc = "gbs-pccs-hw-engr-team1@hp.com;";
      subject = "CS AV Phweb and GPys Description update – Priority";
      body = `Hi Team,%0d%0a%0d%0aRequest to update Phweb and GPSy for below AV’s:%0d%0a`;
    }

    if (window.confirm("Do you want to open in mail app?"))
      window.open(`mailto:${to}?cc=${cc}&subject=${subject}&body=${body}`);
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

    let { title, viewContents, loading_email, loading_upload } = this.state;
    return (
      <div className="App">
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
            <option value="apj">APJ</option>
            <option value="emea">EMEA</option>
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
                className="w3-button w3-round w3-blue react_button"
              >
                View Contents
              </button>
              <br />
              <ButtonLoaderContainer
                onButtonSubmit={this.uploadData.bind(this)}
                text="Upload"
                color="blue"
                loading={loading_upload}
              />
            </div>
          )}
          {viewContents && (
            <div>
              <ButtonLoaderContainer
                onButtonSubmit={this.uploadData.bind(this)}
                text="Upload"
                color="blue"
                loading={loading_upload}
              />
              <br />
              <ButtonLoaderContainer
                onButtonSubmit={this.sendTemplate.bind(this)}
                text="Auto-Generate Email"
                color="light-grey"
                loading={loading_email}
              />

              <button
                onClick={this.openMailApp.bind(this)}
                className="w3-button w3-round w3-light-grey react_button"
              >
                Send Email Manually
              </button>
              <br />

              <table className="partsTable">
                <tr>
                  <th>ID</th>
                  <th>Generic AV</th>
                  <th>Specific AV</th>
                  <th>Description</th>
                  <th>Region</th>
                  <th>Price</th>
                </tr>
                {this.renderTableData(true)}
              </table>
              <br />
            </div>
          )}
        </form>
        <Link to="/home">
          <button className="w3-button w3-round w3-light-grey react_button">
            Home Page
          </button>
        </Link>
        <br />
        <br />
      </div>
    );
  }
}

/*
import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { csv } from "d3";

class UploadPartsContainer extends Component {
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

    const that = this

    event.preventDefault();
    if (that.state.file !== "") {
      const formData = new FormData();
      formData.append("file", that.state.file);

      axios
        .post("https://infinite-fjord-35061.herokuapp.com/api/upload", formData, {
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
            className="w3-button w3-round w3-black react_button"
          >
            Upload
          </button>
        </form>
        <br />
        <Link to="/home">
          <button className="w3-button w3-round w3-black react_button">Main Page</button>
        </Link>
      </div>
    );
  }
}
*/

export default UploadPartsContainer;
