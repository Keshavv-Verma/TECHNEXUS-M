import React, { useState } from 'react';

const CouponInput = ({ appliedCoupon, onApply, onRemove, subtotal, disabled }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim() || disabled) return;
    setLoading(true);
    try {
      await onApply(code.trim());
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="coupon-row">
        <span className="free" style={{ flex: 1 }}>
          {appliedCoupon.code} applied (-₹{appliedCoupon.discountAmount})
        </span>
        <button type="button" className="btn-secondary" onClick={onRemove} disabled={disabled}>
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="coupon-row">
      <input
        type="text"
        placeholder="Coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        disabled={disabled || loading}
      />
      <button type="button" className="btn-secondary" onClick={handleApply} disabled={disabled || loading}>
        {loading ? '...' : 'Apply'}
      </button>
    </div>
  );
};

export default CouponInput;
