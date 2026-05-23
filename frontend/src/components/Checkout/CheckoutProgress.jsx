import React from 'react';

const STEPS = ['Cart Review', 'Address', 'Payment', 'Confirm'];

const CheckoutProgress = ({ currentStep }) => (
  <div className="checkout-progress">
    {STEPS.map((label, i) => {
      const stepNum = i + 1;
      const done = currentStep > stepNum;
      const active = currentStep === stepNum;
      return (
        <div key={label} className={`step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
          <span>{stepNum}.</span> {label}
        </div>
      );
    })}
  </div>
);

export default CheckoutProgress;
