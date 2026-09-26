import React from 'react';
import { Banknote, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { PAYMENT_METHODS } from '../../utils/constants';
import { useSettings } from '../../context/SettingsContext';

export const PaymentSelector = ({ selectedMethod, onSelectMethod }) => {
  const { codSettings, paymentSettings } = useSettings();

  const isCodEnabled = codSettings?.enabled ?? true;
  const isRazorpayEnabled = paymentSettings?.razorpayEnabled ?? true;

  const availableMethods = PAYMENT_METHODS.filter((method) => {
    if (method.id === 'COD') return isCodEnabled;
    if (method.id === 'RAZORPAY') return isRazorpayEnabled;
    return true;
  });

  return (
    <div className="checkout-card">
      <h3 className="checkout-card-title">
        2. Choose Payment Method
      </h3>

      {availableMethods.length === 0 ? (
        <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>Payment options are currently disabled by store administration. Please contact support.</span>
        </div>
      ) : (
        <div className="payment-options-list">
          {availableMethods.map((method) => {
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
      )}
    </div>
  );
};

export default PaymentSelector;
