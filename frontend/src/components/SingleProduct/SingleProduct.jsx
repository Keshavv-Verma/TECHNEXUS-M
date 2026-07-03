import React, { useContext, useState } from "react";
import "./SingleProduct.css";
import { FaCartArrowDown } from "react-icons/fa";
import { CiFacebook, CiInstagram, CiLinkedin } from "react-icons/ci";
import { FiTwitter } from "react-icons/fi";
import { ImPinterest2 } from "react-icons/im";
import RelatedProduct from "./RelatedProduct/RelatedProduct";

import Notification from "../Notification/Notification";

import useFetch from "../../hooks/useFetch";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../context/AppContext";
import { addCartItem } from "../../services/cartService";
import { isLoggedIn } from "../../utils/authUtils";

function SingleProduct() {
  const [count, setCount] = useState(1);
  // notification block
  const [showNotification, setShowNotification] = useState(false);

  const increment = () => {
    setCount((previouscount) => previouscount + 1);
  };
  const decrement = () => {
    setCount((previouscount) => {
      if (previouscount === 1) {
        return 1;
      } else {
        return previouscount - 1;
      }
    });
  };

  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useFetch(`/api/products/${id}`);

  const { handleAddToCart } = useContext(Context);

  if (!data) return;
  const product = data.data[0].attributes;

  const AddToCartNotification = () => {
    // Logic for adding product to the cart

    // Show the notification
    setShowNotification(true);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  return (
    <div className="single-product-main-content">
      <div className="layoutt">
        <div className="single-product-page">
          <div className="leftt">
            <img src={product.img.data[0].attributes.url} alt="productimage" />
          </div>

          <div className="rightt">
            <span className="name">{product.title}</span>
            <span className="prices">₹ {product.price}</span>
            <span className="desc">{product.desc}</span>

            <div className="cart_buttons">
              <div className="quantity_buttons">
                <span onClick={decrement} className="incdec_btns">
                  -
                </span>
                <span>{count}</span>
                <span onClick={increment} className="incdec_btns">
                  +
                </span>
              </div>

              <button
                className="add_to_cart_button"
                onClick={async () => {
                  if (!isLoggedIn()) {
                    navigate('/login', { state: { redirect: `/product/${data.data[0].id}` } });
                    return;
                  }

                  try {
                    await addCartItem(data.data[0].id, count);
                  } catch (error) {
                    console.error('Backend cart add failed:', error.message || error);
                  }
                  handleAddToCart(data.data[0], count);
                  setCount(1);
                  AddToCartNotification();
                }}
              >
                <FaCartArrowDown />
                ADD TO CART
              </button>
              {/* Notification component */}
              {showNotification && (
                <Notification
                  message="Product added to cart!"
                  onClose={handleNotificationClose}
                />
              )}
            </div>

            <span className="divider" />

            <div className="info_item">
              <span className="text_bold">
                Category:{" "}
                <span>{product.categories.data[0].attributes.title}</span>{" "}
              </span>
              <span className="text_bold">
                Share:{" "}
                <span className="social_icons">
                  {" "}
                  <CiFacebook /> <FiTwitter /> <CiInstagram /> <CiLinkedin />{" "}
                  <ImPinterest2 />{" "}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <RelatedProduct
        productId={id}
        categoryId={product.categories.data[0].id}
      />
    </div>
  );
}

export default SingleProduct;
