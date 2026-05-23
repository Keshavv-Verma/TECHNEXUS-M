import React from 'react';

const METHODS = [
  { id: 'UPI', label: 'UPI' },
  { id: 'CREDIT_CARD', label: 'Credit Card' },
  { id: 'DEBIT_CARD', label: 'Debit Card' },
  { id: 'NET_BANKING', label: 'Net Banking' },
  { id: 'COD', label: 'Cash on Delivery' },
];

const PaymentMethods = ({ method, onMethodChange, cardDetails, onCardChange, cardErrors }) => {
  const needsCard = method === 'CREDIT_CARD' || method === 'DEBIT_CARD';
  const needsRazorpay = method === 'UPI' || method === 'NET_BANKING';

  return (
    <div>
      <div className="payment-methods">
        {METHODS.map((m) => (
          <div
            key={m.id}
            className={`payment-method ${method === m.id ? 'selected' : ''}`}
            onClick={() => onMethodChange(m.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onMethodChange(m.id)}
          >
            {m.label}
          </div>
        ))}
      </div>

      {needsCard && (
        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="form-group full">
            <label>Cardholder Name</label>
            <input
              value={cardDetails.name || ''}
              onChange={(e) => onCardChange({ ...cardDetails, name: e.target.value })}
            />
            {cardErrors.name && <div className="error">{cardErrors.name}</div>}
          </div>
          <div className="form-group full">
            <label>Card Number</label>
            <input
              value={cardDetails.number || ''}
              onChange={(e) => onCardChange({ ...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
              placeholder="4111 1111 1111 1111"
            />
            {cardErrors.number && <div className="error">{cardErrors.number}</div>}
          </div>
          <div className="form-group">
            <label>Expiry (MM/YY)</label>
            <input
              value={cardDetails.expiry || ''}
              onChange={(e) => onCardChange({ ...cardDetails, expiry: e.target.value })}
              placeholder="12/25"
            />
            {cardErrors.expiry && <div className="error">{cardErrors.expiry}</div>}
          </div>
          <div className="form-group">
            <label>CVV</label>
            <input
              type="password"
              value={cardDetails.cvv || ''}
              onChange={(e) => onCardChange({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              maxLength={4}
            />
            {cardErrors.cvv && <div className="error">{cardErrors.cvv}</div>}
          </div>
        </div>
      )}

      {(needsRazorpay || needsCard) && (
        <p style={{ fontSize: 13, color: 'var(--checkout-muted)', marginTop: 12 }}>
          Card, UPI, and Net Banking payments are processed securely via Razorpay.
        </p>
      )}

      {method === 'COD' && (
        <p style={{ fontSize: 13, color: 'var(--checkout-muted)', marginTop: 12 }}>
          Pay when your order is delivered.
        </p>
      )}
    </div>
  );
};

export { METHODS };
export default PaymentMethods;
