import React from 'react';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const CartSummary = ({ pricing, config, loading }) => {
  if (loading || !pricing) {
    return (
      <div className="summary-card checkout-sidebar">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  }

  const { subtotal, couponDiscount, shippingCharge, taxAmount, totalAmount, isFreeDelivery, estimatedDelivery } =
    pricing;

  return (
    <div className="summary-card checkout-sidebar">
      <h3>Order Summary</h3>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>₹{subtotal?.toLocaleString('en-IN')}</span>
      </div>
      {couponDiscount > 0 && (
        <div className="summary-row">
          <span>Coupon Discount</span>
          <span className="free">-₹{couponDiscount.toLocaleString('en-IN')}</span>
        </div>
      )}
      <div className="summary-row">
        <span>Shipping</span>
        <span className={isFreeDelivery ? 'free' : ''}>
          {isFreeDelivery ? 'Free Delivery' : `₹${shippingCharge.toLocaleString('en-IN')}`}
        </span>
      </div>
      <div className="summary-row">
        <span>GST ({Math.round((config?.gstRate || 0.18) * 100)}%)</span>
        <span>₹{taxAmount?.toLocaleString('en-IN')}</span>
      </div>
      <div className="summary-row total">
        <span>Total</span>
        <span>₹{totalAmount?.toLocaleString('en-IN')}</span>
      </div>
      {estimatedDelivery && (
        <div className="delivery-info">
          <strong>Estimated Delivery</strong>
          <p>{estimatedDelivery.businessDays} business days</p>
          <p>
            {formatDate(estimatedDelivery.earliest)} – {formatDate(estimatedDelivery.latest)}
          </p>
          {config && !isFreeDelivery && (
            <p style={{ marginTop: 8, opacity: 0.8 }}>
              Free delivery on orders above ₹{config.freeDeliveryThreshold?.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CartSummary;
