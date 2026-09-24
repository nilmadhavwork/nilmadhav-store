import React from 'react';
import { Banknote, CreditCard, ShieldCheck } from 'lucide-react';
import { PAYMENT_METHODS } from '../../utils/constants';

export const PaymentSelector = ({ selectedMethod, onSelectMethod }) => {
  return (
    <div className="checkout-card">
      <h3 className="checkout-card-title">
        2. Choose Payment Method
      </h3>

      <div className="payment-options-list">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isCod = method.id === 'COD';

          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className={`payment-option-card ${isSelected ? 'selected' : ''}`}
            >
              <div className="payment-option-left">
                <div className={`payment-radio ${isSelected ? 'active' : ''}`}>
                  {isSelected && <div className="payment-radio-dot" />}
                </div>

                <div className={`payment-icon-box ${isCod ? 'cod' : 'online'}`}>
                  {isCod ? <Banknote size={22} /> : <CreditCard size={22} />}
                </div>

                <div className="payment-option-details">
                  <div className="payment-option-title">
                    {method.label}
                  </div>
                  <div className="payment-option-desc">
                    {method.desc}
                  </div>
                </div>
              </div>

              {!isCod && (
                <div className="payment-secure-badge">
                  <ShieldCheck size={14} />
                  <span>Razorpay Secure</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentSelector;
