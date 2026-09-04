import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from '../../utils/formatters';

export const OrderCard = ({ order }) => {
  if (!order) return null;

  const {
    _id,
    orderNumber,
    createdAt,
    items = [],
    totalAmount = 0,
    paymentMethod,
    paymentStatus,
    orderStatus,
    shipping = {},
  } = order;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary-dark)' }}>
              {orderNumber}
            </span>
            <span className={`badge ${getOrderStatusBadge(orderStatus)}`}>
              {orderStatus}
            </span>
            <span className={`badge ${getPaymentStatusBadge(paymentStatus)}`}>
              {paymentStatus} ({paymentMethod})
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Placed on {formatDate(createdAt, true)}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
            {formatCurrency(totalAmount)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {items.length} {items.length === 1 ? 'saree' : 'sarees'}
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--color-bg-alt)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              minWidth: '220px',
            }}
          >
            <img
              src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80'}
              alt={item.productName}
              style={{ width: '45px', height: '55px', objectFit: 'cover', borderRadius: '3px' }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
                title={item.productName}
              >
                {item.productName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Qty: {item.quantity} • {formatCurrency(item.price)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Details & Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1.25rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-border-subtle)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          {shipping?.courierName && (
            <span>Courier: <strong>{shipping.courierName}</strong> | </span>
          )}
          {shipping?.awbCode && (
            <span>AWB: <strong>{shipping.awbCode}</strong></span>
          )}
        </div>

        <Link
          to={`/orders/${_id}`}
          className="btn btn-sm btn-outline-gold"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <span>View Order & Tracking Details</span>
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
