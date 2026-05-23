import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyOrders, markOrderReceived } from '../services/checkoutService';
import { isLoggedIn, redirectToLogin } from '../utils/authUtils';
import '../components/Checkout/Checkout.css';
import './Orders.css';

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMyOrders();
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      redirectToLogin(navigate, '/orders');
      return;
    }
    loadOrders();
  }, [navigate, loadOrders]);

  const handleReceived = async (orderId) => {
    if (!window.confirm('Confirm you have received this order? It will be removed from your list.')) {
      return;
    }
    setProcessingId(orderId);
    try {
      await markOrderReceived(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (e) {
      setError(e.message || 'Failed to mark order as received');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="orders-page checkout-flow">
        <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className="orders-page checkout-flow">
      <div className="orders-header">
        <h1>My Orders</h1>
        <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Continue Shopping
        </Link>
      </div>

      {error && <div className="checkout-toast error">{error}</div>}

      {!orders.length ? (
        <div className="empty-checkout">
          <h2>No active orders</h2>
          <p>Orders appear here after you complete checkout. Mark them as received when they arrive.</p>
          <Link to="/cart" className="btn-primary" style={{ display: 'inline-block', width: 'auto', marginTop: 16 }}>
            Go to Cart
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card checkout-main">
              <div className="order-card-head">
                <div>
                  <h2>{order.orderNumber}</h2>
                  <p className="order-meta">Placed {formatDate(order.createdAt)}</p>
                </div>
                <span className={`order-status-badge status-${(order.status || 'pending').toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                <h3>Items</h3>
                {(order.orderItems || []).map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="order-item-row">
                    {item.image && <img src={item.image} alt={item.name} />}
                    <div>
                      <strong>{item.name}</strong>
                      <p>
                        Qty {item.quantity} × ₹{item.price?.toLocaleString('en-IN')} = ₹
                        {(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary-grid">
                <p>
                  <strong>Payment:</strong> {order.paymentMethod?.replace(/_/g, ' ')} — {order.paymentStatus}
                </p>
                <p>
                  <strong>Total:</strong> ₹{order.totalAmount?.toLocaleString('en-IN')}
                </p>
                {order.deliveryAddress && (
                  <p>
                    <strong>Deliver to:</strong> {order.deliveryAddress.fullName},{' '}
                    {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </p>
                )}
              </div>

              <div className="order-card-actions">
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: 'auto' }}
                  disabled={processingId === order._id}
                  onClick={() => handleReceived(order._id)}
                >
                  {processingId === order._id ? 'Processing…' : 'Received'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(`/track-order/${order.orderNumber}`)}
                >
                  Track Order
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
