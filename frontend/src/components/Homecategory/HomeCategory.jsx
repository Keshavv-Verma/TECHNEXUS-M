import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/AppContext";
import "./homecategory.css";

const Hcategory = () => {
  const { state } = useContext(Context);

  const navigate = useNavigate();

  return (
    <div className="shop-by-category">
      <h2>Explore Popular Category</h2>
      <div className="categories">
        {state?.categories?.data?.map((item) => (
          <div
            key={item.id}
            className="category"
            onClick={() => navigate(`/category/${item.id}`)}
          >
            <img src={item.attributes.img.data.attributes.url} alt="" />
            <div className="headingggg">
              <span>{item.attributes.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hcategory;
