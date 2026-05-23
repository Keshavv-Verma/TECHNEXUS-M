import React from "react";
import "./AddSection.css";
import ip from "../../assets/ip15.png";

const AddSection = () => {
  return (
    <div className="add-container">
      <div className="add-section">
        <div className="add-text-left">
          <h1>Dynamic Island stays on top of it all.</h1>
        </div>
        <div className="add-img-text">
          <div className="add-image">
            <img src={ip} alt="iphone pic" />
          </div>
          <div className="add-text-right">
            <h1>Apple iPhone 15, 128 GB - Black</h1>
            <span>-10%* </span>
            <h2>₹ 71,590</h2>
            <p>
              M.R.P.: <del>₹79,900</del>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSection;
