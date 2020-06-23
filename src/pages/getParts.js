import React from "react";
import PartsContainer from "../containers/partsContainer";
// to add home page
const getParts = (props) => {
  return (
    <main className="container">
      <PartsContainer {...props} />
    </main>
  );
};

export default getParts;
