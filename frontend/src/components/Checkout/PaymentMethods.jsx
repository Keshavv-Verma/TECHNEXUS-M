import React from 'react';

const METHODS = [
  { id: 'UPI', label: 'UPI' },
  { id: 'CREDIT_CARD', label: 'Credit Card' },
  { id: 'DEBIT_CARD', label: 'Debit Card' },
  { id: 'NET_BANKING', label: 'Net Banking' },
  { id: 'COD', label: 'Cash on Delivery' },
];

const PaymentMethods = ({ method, onMethodChange }) => {
  const isOnline = method !== 'COD';

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

      {isOnline && (
        <p style={{ fontSize: 13, color: 'var(--checkout-muted)', marginTop: 12 }}>
          You will be securely redirected to Stripe to complete your payment.
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
