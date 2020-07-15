import React from "react";

const ButtonLoaderContainer = ({ onButtonSubmit, text, color, loading }) => {
  const button_css = "w3-button w3-round react_button w3-" + color;

  return (
    <span>
      <button
        onClick={onButtonSubmit}
        className={button_css}
        disabled={loading}
      >
        {loading && (
          <span>
            <i className="fa fa-refresh fa-spin"></i>&nbsp;
          </span>
        )}
        {text}
      </button>
    </span>
  );
};

export default ButtonLoaderContainer;
