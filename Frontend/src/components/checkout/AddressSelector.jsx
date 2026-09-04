import React from 'react';
import { Plus, Check, MapPin, Phone } from 'lucide-react';
import Button from '../common/Button';

export const AddressSelector = ({
  addresses = [],
  selectedAddressId,
  onSelectAddress,
  onOpenAddModal,
}) => {
  return (
    <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.75rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>
          1. Select Delivery Address
        </h3>
        <Button variant="outline-gold" size="sm" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Add New Address</span>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <MapPin size={32} color="var(--color-gold-dark)" style={{ margin: '0 auto 0.5rem auto' }} />
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            No saved addresses found. Please add a shipping destination to proceed.
          </p>
          <Button variant="primary" size="sm" onClick={onOpenAddModal}>
            Add Delivery Address
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {addresses.map((addr) => {
            const isSelected = addr._id === selectedAddressId;
            return (
              <div
                key={addr._id}
                onClick={() => onSelectAddress(addr._id)}
                style={{
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: isSelected ? 'var(--color-primary-subtle)' : '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>
                    {addr.fullName}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {addr.isDefault && (
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                        Default
                      </span>
                    )}
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                      {addr.addressType || 'HOME'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.65rem' }}>
                  <div>{addr.addressLine1}</div>
                  {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                  <div>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </div>
                  <div>{addr.country || 'India'}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  <Phone size={14} />
                  <span>{addr.phone}</span>
                </div>

                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={12} />
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

export default AddressSelector;
