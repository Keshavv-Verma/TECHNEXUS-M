import React, { useState, useEffect, useCallback } from 'react';
import { MdClose } from 'react-icons/md';
import { BsCartX } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import CheckoutFlow from '../Checkout/CheckoutFlow';
import { loadCart, saveCart } from '../../utils/cartUtils';
import './Cart.css';

const Cart = ({ setShowCart }) => {
  const isPage = !setShowCart;
  const [cartItems, setCartItems] = useState(loadCart);

  const loadCartState = useCallback(() => {
    setCartItems(loadCart());
  }, []);

  useEffect(() => {
    window.addEventListener('cartUpdated', loadCartState);
    return () => window.removeEventListener('cartUpdated', loadCartState);
  }, [loadCartState]);

  const removeFromCart = (productId) => {
    const updated = cartItems.filter((item) => item.id !== productId);
    saveCart(updated);
    setCartItems(updated);
  };

  const updateQuantity = (productId, change) => {
    const updated = cartItems
      .map((item) => {
        if (item.id !== productId) return item;
        const newQty = item.quantity + change;
        if (newQty < 1) return item;
        if (newQty > (item.stock ?? 99)) return item;
        return { ...item, quantity: newQty };
      })
      .filter(Boolean);
    saveCart(updated);
    setCartItems(updated);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  if (isPage) {
    return (
      <div className="cart-page">
        <CheckoutFlow />
      </div>
    );
  }

  return (
    <div className="cart-panel">
      <div className="opac-layer" onClick={() => setShowCart(false)} role="presentation" />
      <div className="cart-content">
        <div className="cart-header">
          <span className="heading">Shopping Cart</span>
          <span className="close-btn" onClick={() => setShowCart(false)}>
            <MdClose />
            <span className="text">close</span>
          </span>
        </div>

        {cartItems.length === 0 && (
          <div className="empty-cart">
            <BsCartX />
            <span>No products in the cart.</span>
          </div>
        )}

        {cartItems.length > 0 && (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <span className="name">{item.name}</span>
                    <div className="quantity-buttons">
                      <span onClick={() => updateQuantity(item.id, -1)}>-</span>
                      <span>{item.quantity}</span>
                      <span onClick={() => updateQuantity(item.id, 1)}>+</span>
                    </div>
                    <div className="text">
                      <span>{item.quantity}</span>
                      <span>x</span>
                      <span>₹{item.price}</span>
                    </div>
                  </div>
                  <div className="item-remove" onClick={() => removeFromCart(item.id)}>
                    <MdClose className="close-btn" />
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="subtotal">
                <span className="text">Subtotal:</span>
                <span className="text total">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="button">
                <Link
                  to="/cart"
                  className="checkout-cta"
                  onClick={() => setShowCart(false)}
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
