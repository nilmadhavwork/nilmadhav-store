import React from 'react';
import { Banknote, CreditCard, ShieldCheck } from 'lucide-react';
import { PAYMENT_METHODS } from '../../utils/constants';

export const PaymentSelector = ({ selectedMethod, onSelectMethod }) => {
  return (
    <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.75rem', marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '1.25rem' }}>
        2. Choose Payment Method
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isCod = method.id === 'COD';

          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: isSelected ? 'var(--color-primary-subtle)' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isCod ? '#FEF3C7' : '#EFF6FF',
                  color: isCod ? '#B45309' : '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isCod ? <Banknote size={22} /> : <CreditCard size={22} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.975rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                  {method.label}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  {method.desc}
                </div>
              </div>

              {!isCod && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-gold-dark)', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--color-gold-border)', backgroundColor: 'var(--color-gold-bg)', padding: '3px 8px', borderRadius: '4px' }}>
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
