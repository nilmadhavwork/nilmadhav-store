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
    <div className="checkout-card">
      <div className="checkout-header-row">
        <h3 className="checkout-card-title">
          1. Select Delivery Address
        </h3>
        <Button variant="outline-gold" size="sm" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Add New Address</span>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="address-empty-state">
          <MapPin size={32} color="var(--color-gold-dark)" style={{ margin: '0 auto 0.5rem auto' }} />
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            No saved addresses found. Please add a shipping destination to proceed.
          </p>
          <Button variant="primary" size="sm" onClick={onOpenAddModal}>
            Add Delivery Address
          </Button>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((addr) => {
            const isSelected = addr._id === selectedAddressId;
            return (
              <div
                key={addr._id}
                onClick={() => onSelectAddress(addr._id)}
                className={`address-card-item ${isSelected ? 'selected' : ''}`}
              >
                <div className="address-card-top">
                  <span className="address-card-name">
                    {addr.fullName}
                  </span>
                  <div className="address-card-badges">
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

                <div className="address-card-lines">
                  <div>{addr.addressLine1}</div>
                  {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                  <div>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </div>
                  <div>{addr.country || 'India'}</div>
                </div>

                <div className="address-card-phone">
                  <Phone size={14} />
                  <span>{addr.phone}</span>
                </div>

                {isSelected && (
                  <div className="address-card-check">
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
