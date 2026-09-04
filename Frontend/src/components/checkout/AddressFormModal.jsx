import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export const AddressFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || '',
        country: initialData.country || 'India',
        addressType: initialData.addressType || 'HOME',
        isDefault: Boolean(initialData.isDefault),
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        addressType: 'HOME',
        isDefault: false,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.addressLine1.trim()) errs.addressLine1 = 'Street address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.pincode.trim()) errs.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Enter a valid 6-digit Indian PIN code';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Delivery Address' : 'Add New Delivery Address'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Full Name"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
            placeholder="e.g. Ananya Sharma"
          />
          <Input
            label="Phone Number"
            required
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
            placeholder="10-digit mobile"
          />
        </div>

        <Input
          label="Flat / House / Building / Apartment"
          required
          value={formData.addressLine1}
          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          error={errors.addressLine1}
          placeholder="e.g. Flat 402, Lotus Residency"
        />

        <Input
          label="Area / Street / Sector / Landmark (Optional)"
          value={formData.addressLine2}
          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          placeholder="e.g. Near Ring Road Temple"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '1rem' }}>
          <Input
            label="City"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            error={errors.city}
            placeholder="e.g. Surat"
          />
          <Input
            label="State"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            error={errors.state}
            placeholder="e.g. Gujarat"
          />
          <Input
            label="Pincode"
            required
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            error={errors.pincode}
            placeholder="395002"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
          <div className="form-group">
            <label className="form-label">Address Type</label>
            <select
              className="form-select"
              value={formData.addressType}
              onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
            >
              <option value="HOME">Home (All-day delivery)</option>
              <option value="OFFICE">Office (10 AM - 6 PM)</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
              />
              <span>Set as default address</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Save Address
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressFormModal;
