import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderByNumber } from '../services/checkoutService';
import { isLoggedIn, redirectToLogin } from '../utils/authUtils';
import '../components/Checkout/Checkout.css';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const TrackOrder = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      redirectToLogin(navigate, `/track-order/${orderNumber}`);
      return;
    }
    getOrderByNumber(orderNumber)
      .then(setOrder)
      .catch((e) => {
        if (e.isAuthError || e.name === 'AuthError') {
          redirectToLogin(navigate, `/track-order/${orderNumber}`);
        } else {
          setError(e.message);
        }
      })
      .finally(() => setLoading(false));
  }, [orderNumber, navigate]);

  const statusIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  if (loading) {
    return (
      <div className="checkout-flow">
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="checkout-flow">
        <h2>Order not found</h2>
        <p style={{ color: 'var(--checkout-muted)' }}>{error}</p>
        <Link to="/cart">Back to Cart</Link>
      </div>
    );
  }

  return (
    <div className="checkout-flow">
      <h1 style={{ marginBottom: 8 }}>Track Order</h1>
      <p style={{ color: 'var(--checkout-muted)', marginBottom: 24 }}>
        Order {order.orderNumber}
      </p>

      <div className="checkout-main" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {STATUS_STEPS.map((s, i) => (
            <span
              key={s}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 12,
                background: i <= statusIndex ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                color: i <= statusIndex ? '#10b981' : '#8b949e',
              }}
            >
              {s}
            </span>
          ))}
        </div>

        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Payment:</strong> {order.paymentStatus} ({order.paymentMethod})
        </p>
        <p>
          <strong>Total:</strong> ₹{order.totalAmount?.toLocaleString('en-IN')}
        </p>

        <h3 style={{ marginTop: 24, marginBottom: 12 }}>Items</h3>
        {order.orderItems?.map((item, idx) => (
          <div className="cart-item-row" key={idx}>
            {item.image && <img src={item.image} alt={item.name} />}
            <div>
              <strong>{item.name}</strong>
              <p>
                Qty: {item.quantity} — ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Link to="/" className="btn-primary" style={{ display: 'inline-block', width: 'auto', marginTop: 24 }}>
        Continue Shopping
      </Link>
    </div>
  );
};

export default TrackOrder;
