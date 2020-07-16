import React, { Component } from "react";
import { Link } from "react-router-dom";
import auth from "../auth";
import { alertMessage, titleCase } from "./helperFunctions";
import ButtonLoaderContainer from "./buttonLoaderContainer";

class PartsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: auth.name,
      email: auth.email,
      all_unused_av: [],
      all_unused_av_filtered: [],
      all_used_av: [],
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
      buffer_used_status: false,
      loading_get_parts: false,
      loading_update_parts: false,
      loading_replenish_buffer: false,
      loading_unused_buffer: false,
    };
  }

  // MAKE AJAX CALLS HERE
  componentDidMount() {
    console.log("COMPONENT HAS MOUNTED");

    const that = this;

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
            alertMessage("no available parts left to obtain!");
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
      av_regions: [],
      av_regions_status: false,
      av_components: [],
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
      av_components: [],
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
    const that = this;
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
    const that = this;
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
    this.setState({
      av_regions: [],
      av_regions_status: false,
      av_components: [],
      av_components_status: false,
      requested_parts: [],
      parts: undefined,
      lvl2_parts: undefined,
    });
    this.getRegions(event);
    this.getComponents(event);
  }

  getParts(event) {
    const that = this;

    event.preventDefault();

    let av_components = "";
    if (this.refs.av_components && this.refs.av_components.value) {
      av_components = this.refs.av_components.value;
    }

    let data = {
      generic_av: this.refs.generic_av.value,
      quantity: this.refs.quantity.value,
      region:
        this.refs.av_regions === undefined
          ? "no region"
          : this.refs.av_regions.value,
      components: av_components,
    };

    if (
      data.generic_av !== "no generic av" &&
      data.quantity > 0 &&
      data.region !== "no region" &&
      (data.components === "" || data.components !== "no component")
    ) {
      that.setState({
        loading_get_parts: true,
      });
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
              if (that.refs.quantity.value > distinct_av_data.length) {
                alertMessage(
                  `only able to retrieve ${distinct_av_data.length} parts!`
                );
              }
            }
          });
        })
        .catch(function (err) {
          alertMessage("Server Error!");
          window.location.reload(true);
        })
        .finally(() => {
          that.setState({ loading_get_parts: false });
        });
    } else {
      alertMessage("Please fill up the required fields!");
    }
  }

  updatePart(event) {
    const that = this;

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
      alertMessage("no available parts left to obtain!");
      that.resetForms();
    } else if (data.customer !== "") {
      that.setState({
        loading_update_parts: true,
      });
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
              that.emailTable();
              alertMessage("Parts Obtained!");
              that.setState({
                all_av: [],
                all_av_filtered: [],
                all_av_status: false,
              });
              // that.resetForms();
              // that.componentDidMount();
            } else {
              alertMessage("unable to obtain parts!");
            }
          });
        })
        .catch(function (err) {
          alertMessage("Server Error!");
          window.location.reload(true);
        })
        .finally(() => {
          that.setState({ loading_update_parts: false });
        });
    } else {
      alertMessage("Please enter the Customer information!");
    }
  }

  // not being used currently
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

  emailTable() {
    const that = this;

    let tempData = [];
    let emailData = [];

    // that.setState({
    //   loading_email: true,
    // });

    // if (this.state.lvl2_status) {
    //   tempData = JSON.parse(JSON.stringify(this.state.parts));
    //   for (let i = 0; i < tempData.length; i++) {
    //     let temp_obj = {};
    //     temp_obj["Specific AV"] = tempData[i].specific_av;
    //     temp_obj["Generic AV"] = tempData[i].generic_av;
    //     temp_obj["Description"] = tempData[i].description;
    //     emailData.push(temp_obj);
    //   }
    // } else {
    tempData = JSON.parse(JSON.stringify(this.state.lvl2_parts));
    for (let i = 0; i < tempData.length; i++) {
      let temp_obj = {};
      temp_obj["Specific AV"] = tempData[i].specific_av;
      temp_obj["BOM Components"] = tempData[i].level_2_av;
      temp_obj["Generic AV"] = tempData[i].generic_av;
      temp_obj["Description"] = tempData[i].description;
      emailData.push(temp_obj);
    }
    // }

    console.log(tempData, emailData);

    const current_date = new Date();

    let data = {
      user: that.state.email,
      subject: `Parts Obtained by ${titleCase(
        that.state.name
      )} on ${current_date.toDateString()}`,
      data: emailData,
      attachment: "Obtained Parts",
    };

    let request = new Request(
      `${process.env.REACT_APP_API_URL}api/email-upload`,
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
          if (data.message.toLowerCase() === "email sent") {
            console.log("Email sent!");
          } else {
            console.log("unable to send email!");
          }
        });
      })
      .catch(function (err) {
        alertMessage("Server Error!");
        window.location.reload(true);
      });
    // .finally(() => {
    //   that.setState({ loading_email: false });
    // });
  }

  allUnusedParts() {
    const that = this;

    that.setState({
      all_av_status: !that.state.all_av_status,
      buffer_used_status: false,
    });

    const data = {
      used: 0,
    };

    let request = new Request(
      `${process.env.REACT_APP_API_URL}api/get-all_generic_av`,
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
          if (data.message.toLowerCase() !== "no generic avs found") {
            that.setState({
              all_unused_av: data.data,
              all_unused_av_filtered: data.data,
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

  allUsedParts(region, quantity) {
    const that = this;

    that.setState({ loading_unused_buffer: true });

    const data = {
      used: 1,
      region: region,
      quantity: quantity,
    };
    console.log(data);

    let request = new Request(
      `${process.env.REACT_APP_API_URL}api/get-all_generic_av`,
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
          if (data.message.toLowerCase() !== "no generic avs found") {
            that.setState({
              all_used_av: data.data,
            });
            if (quantity > data.data.length) {
              alertMessage(
                `only able to retrieve ${data.data.length} used parts!`
              );
            }
            console.log(data.data);
          } else {
            alertMessage("no generic avs found!");
            that.setState({
              all_used_av: [],
            });
          }
        });
      })
      .catch(function (err) {
        alertMessage("Server Error!");
        window.location.reload(true);
      })
      .finally(() => that.setState({ loading_unused_buffer: false }));
  }

  filterBuffer(event) {
    event.preventDefault();

    const filter_region = this.refs.buffer_region.value;
    const used_status = this.refs.used_status.value === "0" ? false : true;

    this.setState({
      buffer_used_status: used_status,
      all_used_av: [],
    });

    if (!used_status) {
      console.log("hellow world");
      if (filter_region !== "no region") {
        let data = [];
        for (let i = 0; i < this.state.all_unused_av.length; i++) {
          if (this.state.all_unused_av[i].region === filter_region) {
            data.push(this.state.all_unused_av[i]);
          }
        }
        this.setState({ all_unused_av_filtered: data });
      } else {
        this.setState({ all_unused_av_filtered: this.state.all_unused_av });
      }
    } else {
      const quantity = this.refs.buffer_quantity;
      if (quantity && quantity.value && quantity.value > 0) {
        this.allUsedParts(filter_region, quantity.value);
      }
    }
  }

  async emailReplenishment(name, email, to, part, quantity) {
    const that = this;

    let emailData = [
      {
        User: titleCase(name),
        "User Email": titleCase(email),
        "Types of Services Requested": `${part}_BOM`,
        Quantity: quantity,
        "Overwrite LC Dates": "N",
        "PA Date": "",
        "PI Date": "",
        "SA Date": "",
        "PE Date": "",
        "EM Date": "",
        "ES Date": "",
      },
    ];

    const current_date = new Date();
    const date = `${current_date.getFullYear()}${
      current_date.getMonth() + 1
    }${current_date.getDate()}`;

    const fileName = `CS AV User Request Template_${titleCase(
      name
    )}_${part}_BOM_${date}_QTY${quantity}`;

    let data = {
      user: email,
      to: `${to};`,
      subject: `${part}_BOM Replenishment by ${titleCase(
        name
      )} on ${current_date.toDateString()}`,
      data: emailData,
      attachment: fileName,
    };

    let request = new Request(
      `${process.env.REACT_APP_API_URL}api/email-upload`,
      {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
      }
    );

    // xmlhttprequest()
    try {
      const response = await fetch(request, { mode: "cors" });
      const data = await response.json();
      console.log(data);
      if (data.message.toLowerCase() === "email sent") {
        console.log("Email sent!");
        return 1;
      } else {
        console.log("unable to send email!");
        return 0;
      }
    } catch (err) {
      alertMessage("Server Error!");
      window.location.reload(true);
    }
  }

  async replenishBuffer(event) {
    const that = this;

    event.preventDefault();

    that.setState({
      loading_replenish_buffer: true,
    });

    const filter_region = this.refs.buffer_region.value;

    if (filter_region !== "no region") {
      let parts = that.state.all_unused_av_filtered;
      let min_buffer_value = 0;
      let to = "";
      if (filter_region === "apj") {
        min_buffer_value = 10;
        to = "paliwal@hp.com";
      } else if (filter_region === "ams") {
        min_buffer_value = 50;
        to = "krishna.kumar.m@hp.com";
      } else if (filter_region === "emea") {
        min_buffer_value = 50;
        to = "rajesh.m1@hp.com";
      }
      let replenish_parts = [];
      let replenish_string = "";
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].quantity < min_buffer_value) {
          replenish_parts.push(parts[i].generic_av);
          if (replenish_string === "")
            replenish_string += `${parts[i].generic_av}`;
          else replenish_string += `, ${parts[i].generic_av}`;
        }
      }
      console.log(replenish_parts.length);
      if (replenish_parts.length !== 0) {
        if (
          window.confirm(
            `${titleCase(
              `are you sure you want to replenish the following ${replenish_parts.length} parts:\n`
            )}${replenish_string}`
          )
        ) {
          let count = 0;
          for (let i = 0; i < replenish_parts.length; i++) {
            count += await that.emailReplenishment(
              that.state.name,
              that.state.email,
              to,
              replenish_parts[i],
              min_buffer_value
            );
          }
          if (count === replenish_parts.length)
            alertMessage("replenishment emails sent!");
          else alertMessage("unable to send replenishment emails!");
        }
      } else {
        alertMessage("none of the parts need to be replenished!");
      }
    } else {
      alertMessage("Please select one of the regions!");
    }
    that.setState({
      loading_replenish_buffer: false,
    });
  }

  renderTableDistinctData(parts) {
    return parts.map((part, index) => {
      const { specific_av, generic_av, description } = part;
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
      const { specific_av, level_2_av, generic_av, description } = part;
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

  renderTableAllUnusedData(parts) {
    return parts.map((part, index) => {
      const { generic_av, region, quantity } = part;
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

  renderTableAllUsedData(parts) {
    return parts.map((part, index) => {
      const { date, generic_av, specific_av, requester } = part;
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{date.substring(0, 10)}</td>
          <td>{generic_av}</td>
          <td>{specific_av}</td>
          <td>{titleCase(requester)}</td>
        </tr>
      );
    });
  }

  // show loading icon when data is being retrieved
  render() {
    let name = titleCase(this.state.name);

    let parts = undefined;
    if (this.state.lvl2_status) {
      parts = this.state.parts;
    } else {
      parts = this.state.lvl2_parts;
    }

    let all_unused_parts = this.state.all_unused_av_filtered;
    let all_used_parts = this.state.all_used_av;
    let all_parts_status = this.state.all_av_status;

    let {
      available_av,
      av_regions,
      av_regions_status,
      av_components,
      av_components_status,
      buffer_used_status,
      loading_get_parts,
      loading_update_parts,
      loading_replenish_buffer,
      loading_unused_buffer,
    } = this.state;

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
              <ButtonLoaderContainer
                onButtonSubmit={this.getParts.bind(this)}
                text="Show Parts"
                color="blue"
                loading={loading_get_parts}
              />
            </div>
          )}
        </form>
        {available_av.length === 0 && (
          <div>
            <button
              onClick={this.componentDidMount.bind(this)}
              className="w3-button w3-round w3-blue react_button"
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
                {/* <button
                  onClick={this.exportCsv.bind(this)}
                  className="w3-button w3-round w3-light-grey react_button"
                >
                  Download Table
                </button>
                <ButtonLoaderContainer
                  onButtonSubmit={this.emailTable.bind(this)}
                  text="Email Table"
                  color="light-grey"
                  loading={loading_email}
                /> */}
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
                {/* <button
                  onClick={this.exportCsv.bind(this)}
                  className="w3-button w3-round w3-light-grey react_button"
                >
                  Download Table
                </button>
                <ButtonLoaderContainer
                  onButtonSubmit={this.emailTable.bind(this)}
                  text="Email Table"
                  color="light-grey"
                  loading={loading_email}
                /> */}
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
              <ButtonLoaderContainer
                onButtonSubmit={this.updatePart.bind(this)}
                text="Obtain Parts"
                color="blue"
                loading={loading_update_parts}
              />
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
        <Link to="/upload">
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
            onClick={this.allUnusedParts.bind(this)}
            className="w3-button w3-round w3-light-grey react_button"
          >
            View Buffer
          </button>
        )}
        {all_parts_status && (
          <div>
            <button
              onClick={this.allUnusedParts.bind(this)}
              className="w3-button w3-round w3-blue react_button"
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
            <select
              onChange={this.filterBuffer.bind(this)}
              className="input_text getParts_input"
              ref="used_status"
            >
              <option value="0">Unused</option>
              <hr />
              <option value="1">Used</option>
            </select>
            <br />
            {buffer_used_status && (
              <div>
                <input
                  className="input_text getParts_input"
                  type="number"
                  ref="buffer_quantity"
                  placeholder="Quantity"
                  min="1"
                />
                <br />
                <ButtonLoaderContainer
                  onButtonSubmit={this.filterBuffer.bind(this)}
                  text="Get Latest Used Parts"
                  color="light-grey"
                  loading={loading_unused_buffer}
                />
                {/* <button
                  onClick={this.filterBuffer.bind(this)}
                  className="w3-button w3-round w3-light-grey react_button"
                >
                  Get Latest Used Parts
                </button> */}
                {all_used_parts.length !== 0 && (
                  <table className="partsTable">
                    <tr>
                      <th>ID</th>
                      <th>Date of Request</th>
                      <th>Generic AV</th>
                      <th>Specific AV</th>
                      <th>User Name</th>
                    </tr>
                    {this.renderTableAllUsedData(all_used_parts)}
                  </table>
                )}
              </div>
            )}
            {!buffer_used_status && (
              <div>
                <ButtonLoaderContainer
                  onButtonSubmit={this.replenishBuffer.bind(this)}
                  text="Replenish Parts"
                  color="light-grey"
                  loading={loading_replenish_buffer}
                />
                {/* <button
                  onClick={this.replenishBuffer.bind(this)}
                  className="w3-button w3-round w3-light-grey react_button"
                >
                  Replenish Parts
                </button> */}
                {all_unused_parts.length !== 0 && (
                  <table className="partsTable">
                    <tr>
                      <th>ID</th>
                      <th>Generic AV</th>
                      <th>Region</th>
                      <th>Quantity</th>
                    </tr>
                    {this.renderTableAllUnusedData(all_unused_parts)}
                  </table>
                )}
              </div>
            )}
          </div>
        )}
        <br />
      </div>
    );
  }
}

export default PartsContainer;
