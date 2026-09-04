import React from 'react';
import { ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';

export const CartSummary = ({
  subtotal = 0,
  shippingCost = 0,
  freeShippingThreshold = 5000,
  onCheckout,
  checkoutDisabled = false,
  isCheckoutPage = false,
}) => {
  const calculatedShipping = subtotal >= freeShippingThreshold ? 0 : shippingCost || (subtotal > 0 ? 150 : 0);
  const total = subtotal + calculatedShipping;
  const differenceToFree = freeShippingThreshold - subtotal;

  return (
    <div className="order-summary-box">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem' }}>
        Order Summary
      </h3>

      {/* Free Shipping Progress Indicator */}
      {subtotal > 0 && subtotal < freeShippingThreshold && (
        <div style={{ backgroundColor: 'var(--color-gold-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--color-gold-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-gold-dark)', fontWeight: 600, marginBottom: '0.4rem' }}>
            <Truck size={16} />
            <span>Add {formatCurrency(differenceToFree)} more for Free Shipping!</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#E5D6BD', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%`,
                backgroundColor: 'var(--color-gold)',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>
      )}

      {subtotal >= freeShippingThreshold && subtotal > 0 && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--color-success-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
          <Truck size={16} />
          <span>You have unlocked Complimentary Pan-India Delivery!</span>
        </div>
      )}

      <div className="summary-row">
        <span style={{ color: 'var(--color-text-secondary)' }}>Bag Subtotal</span>
        <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
      </div>

      <div className="summary-row">
        <span style={{ color: 'var(--color-text-secondary)' }}>Estimated Shipping</span>
        <span style={{ fontWeight: 600, color: calculatedShipping === 0 ? 'var(--color-success)' : 'inherit' }}>
          {calculatedShipping === 0 ? 'FREE' : formatCurrency(calculatedShipping)}
        </span>
      </div>

      <div className="summary-row summary-total">
        <span>Grand Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {!isCheckoutPage && (
        <div style={{ marginTop: '1.5rem' }}>
          <Button
            variant="gold"
            block
            size="lg"
            onClick={onCheckout}
            disabled={checkoutDisabled || subtotal <= 0}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
        <ShieldCheck size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
        <span>Authentic Loom Guarantee & 256-bit Secure Checkout</span>
      </div>
    </div>
  );
};

export default CartSummary;
