import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MdOutlineDone } from 'react-icons/md';
import '../components/SuccessPage/Successpage.css';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state || {};

  if (!order.orderNumber) {
    return (
      <div className="successpage-container">
        <div className="success-content">
          <h1>No order found</h1>
          <Link to="/cart" className="get-home">Go to Cart</Link>
        </div>
      </div>
    );
  }

  const addr = order.deliveryAddress;

  return (
    <div className="successpage-container">
      <div className="success-content">
        <div className="success-icon">
          <MdOutlineDone />
        </div>
        <h1>ORDER PLACED SUCCESSFULLY</h1>
        <p>Thank you for shopping with TechNexus!</p>

        <div
          className="payment-details"
          style={{
            marginTop: 20,
            padding: 20,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: 12,
            textAlign: 'left',
            maxWidth: 480,
            margin: '20px auto',
          }}
        >
          <p>
            <strong>Order ID:</strong> {order.orderNumber}
          </p>
          <p>
            <strong>Order Date:</strong> {formatDate(order.createdAt)}
          </p>
          <p>
            <strong>Amount Paid:</strong> ₹{order.totalAmount?.toLocaleString('en-IN')}
          </p>
          <p>
            <strong>Estimated Delivery:</strong> {formatDate(order.estimatedDeliveryEarliest)} –{' '}
            {formatDate(order.estimatedDeliveryLatest)}
          </p>
          {addr && (
            <p>
              <strong>Delivery Address:</strong> {addr.fullName}, {addr.houseNo}, {addr.street}, {addr.city},{' '}
              {addr.state} {addr.pincode}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
          <button type="button" className="get-home" onClick={() => navigate('/orders')}>
            View My Orders
          </button>
          <button type="button" className="get-home" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
          <button
            type="button"
            className="get-home"
            style={{ background: 'transparent', border: '1px solid #10b981' }}
            onClick={() => navigate(`/track-order/${order.orderNumber}`)}
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
