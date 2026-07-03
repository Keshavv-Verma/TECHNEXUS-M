import React, { useState, useEffect, useCallback } from 'react';
import { MdClose } from 'react-icons/md';
import { BsCartX } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import CheckoutFlow from '../Checkout/CheckoutFlow';
import { getCartItems, removeCartItem, updateCartItem } from '../../services/cartService';
import { isLoggedIn, AUTH_CHANGED_EVENT } from '../../utils/authUtils';
import { loadCart, saveCart } from '../../utils/cartUtils';
import './Cart.css';

const Cart = ({ setShowCart }) => {
  const isPage = !setShowCart;
  const [cartItems, setCartItems] = useState([]);
  const updateTimerRef = React.useRef({});
  const removeTimerRef = React.useRef({});

  const loadCartState = useCallback(async () => {
    if (!isLoggedIn()) {
      setCartItems(loadCart());
      return;
    }

    try {
      const items = await getCartItems();
      setCartItems(items);
      saveCart(items);
    } catch (error) {
      console.error('Failed to load cart from server on cartUpdated:', error.message || error);
      setCartItems([]);
      saveCart([]);
    }
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isLoggedIn()) {
        setCartItems(loadCart());
        return;
      }

      try {
        const items = await getCartItems();
        setCartItems(items);
        saveCart(items);
      } catch (error) {
        console.error('Failed to load cart from server:', error.message || error);
        setCartItems([]);
        saveCart([]);
      }
    };

    const updateTimers = updateTimerRef.current;
    const removeTimers = removeTimerRef.current;

    fetchCart();
    window.addEventListener('cartUpdated', loadCartState);
    window.addEventListener(AUTH_CHANGED_EVENT, loadCartState);
    return () => {
      window.removeEventListener('cartUpdated', loadCartState);
      window.removeEventListener(AUTH_CHANGED_EVENT, loadCartState);
      Object.values(updateTimers).forEach(clearTimeout);
      Object.values(removeTimers).forEach(clearTimeout);
    };
  }, [loadCartState]);

  const removeFromCart = async (productId) => {
    const updated = cartItems.filter((item) => item.id !== productId);
    if (isLoggedIn()) {
      const item = cartItems.find((item) => item.id === productId);
      const resolvedProductId = item?.productId || productId;
      clearTimeout(removeTimerRef.current[resolvedProductId]);
      removeTimerRef.current[resolvedProductId] = window.setTimeout(async () => {
        try {
          await removeCartItem(resolvedProductId);
        } catch (error) {
          console.error('Failed to remove cart item from server:', error.message || error);
        }
        delete removeTimerRef.current[resolvedProductId];
      }, 250);
    }
    saveCart(updated);
    setCartItems(updated);
  };

  const updateQuantity = async (productId, change) => {
    const updated = cartItems
      .map((item) => {
        if (item.id !== productId) return item;
        const newQty = item.quantity + change;
        if (newQty < 1) return item;
        if (newQty > (item.stock ?? 99)) return item;
        return { ...item, quantity: newQty };
      })
      .filter(Boolean);

    const changedItem = updated.find((item) => item.id === productId);
    if (isLoggedIn() && changedItem) {
      const resolvedProductId = changedItem.productId || productId;
      clearTimeout(updateTimerRef.current[resolvedProductId]);
      updateTimerRef.current[resolvedProductId] = window.setTimeout(async () => {
        try {
          await updateCartItem(resolvedProductId, changedItem.quantity);
        } catch (error) {
          console.error('Failed to update cart item on server:', error.message || error);
        }
        delete updateTimerRef.current[resolvedProductId];
      }, 250);
    }

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
                    {item.stock <= 0 && <span className="item-stock-status out-of-stock">Out of stock</span>}
                    <div className="quantity-buttons">
                      <span onClick={() => updateQuantity(item.id, -1)}>-</span>
                      <span>{item.quantity}</span>
                      <span
                        className={item.stock <= 0 || item.quantity >= (item.stock ?? 0) ? 'disabled' : ''}
                        onClick={() => {
                          if (item.stock <= 0 || item.quantity >= (item.stock ?? 0)) return;
                          updateQuantity(item.id, 1);
                        }}
                      >+
                      </span>
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
