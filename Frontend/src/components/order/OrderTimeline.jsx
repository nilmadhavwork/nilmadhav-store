import React from 'react';
import {
  Check,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export const OrderTimeline = ({ orderStatus, shipping = {} }) => {
  if (orderStatus === 'CANCELLED') {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-danger-bg)',
          border: '1px solid var(--color-danger-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: 'var(--color-danger)',
          margin: '1.5rem 0',
        }}
      >
        <XCircle size={28} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>Order Cancelled</div>
          <div style={{ fontSize: '0.85rem' }}>
            This order has been cancelled and stock has been restored.
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'PACKED', label: 'Packed', icon: Package },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: MapPin },
  ];

  const statusHierarchy = {
    PENDING: 0,
    CONFIRMED: 1,
    PACKED: 2,
    SHIPPED: 3,
    OUT_FOR_DELIVERY: 4,
    DELIVERED: 5,
  };

  const currentIndex = statusHierarchy[orderStatus] ?? 0;

  return (
    <div className="timeline-wrapper" style={{ margin: '2rem 0' }}>
      <div className="timeline-container">
        {/* Continuous background track */}
        <div className="timeline-line" />

        {/* Active progress fill */}
        <div
          className="timeline-line"
          style={{
            backgroundColor: 'var(--color-success)',
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            transition: 'width 400ms ease',
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="timeline-dot">
                {isCompleted ? <Check size={18} /> : <Icon size={16} />}
              </div>
              <div className="timeline-label">{step.label}</div>
            </div>
          );
        })}
      </div>

      {/* Shiprocket Courier Tracking Card if Shipped */}
      {(shipping?.awbCode || shipping?.courierName || shipping?.trackingUrl) && (
        <div
          style={{
            backgroundColor: 'var(--color-gold-bg)',
            border: '1px solid var(--color-gold-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            marginTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gold-dark)', fontWeight: 700, marginBottom: '0.25rem' }}>
              Shiprocket Live Logistics
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>
              {shipping.courierName && (
                <span>Courier: <strong>{shipping.courierName}</strong> &bull; </span>
              )}
              {shipping.awbCode && (
                <span>AWB Tracking No: <strong>{shipping.awbCode}</strong></span>
              )}
            </div>
            {shipping.status && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Shipment Status: <strong>{shipping.status.replace(/_/g, ' ')}</strong>
              </div>
            )}
          </div>

          {shipping.trackingUrl && (
            <a
              href={shipping.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>Track on Courier Site</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
