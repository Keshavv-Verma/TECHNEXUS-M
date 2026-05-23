import React, { useState } from "react";
import "./Product.css";
import { useNavigate } from "react-router-dom";
import { MdOutlineNavigateNext } from "react-icons/md";

const Product = ({ id, data }) => {
  // console.log("dataaaaaaaaaaaaaaaaaaaa",data);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseOver = () => {
    setIsHovering(true);
  };
  const handleMouseOut = () => {
    setIsHovering(false);
  };

  const navigate = useNavigate();

  return (
    <div
      className="product-card"
      onClick={() => navigate("/product/" + id)}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div className="thumbnail">
        <img src={data?.img.data[0].attributes.url} alt="productimage" />
      </div>
      <div className="prod-details">
        <span className="name">{data.title}</span>
        <div className="bottom">
          <span className="price">
            <span className="rupee-icon">₹</span> {data.price}
          </span>
          {isHovering && (
            <span className="navigate">
              Details <MdOutlineNavigateNext />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
