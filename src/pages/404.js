import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="App">
      <br />
      <h1>
        <b>404 Not Found!</b>
      </h1>
      <Link to="/home">
        <button className="w3-button w3-light-grey react_button">
          Login Page
        </button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
