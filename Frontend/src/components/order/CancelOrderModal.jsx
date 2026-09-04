import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';

export const CancelOrderModal = ({
  isOpen,
  onClose,
  onConfirmCancel,
  orderNumber,
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }
    setError('');
    onConfirmCancel(reason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Saree Order"
      maxWidth="480px"
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div style={{ backgroundColor: 'var(--color-danger-bg)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-danger)' }}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            Are you sure you want to cancel order #{orderNumber}?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Once cancelled, the sarees will be returned to stock inventory. If you already paid online, our team will initiate your refund.
          </p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Cancellation Reason <span className="required">*</span>
        </label>
        <select
          className="form-select"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError('');
          }}
        >
          <option value="">-- Select a reason --</option>
          <option value="Changed mind about color/design">Changed mind about color/design</option>
          <option value="Ordered by mistake">Ordered by mistake</option>
          <option value="Found a different saree">Found a different saree</option>
          <option value="Incorrect shipping address entered">Incorrect shipping address entered</option>
          <option value="Delivery time is too long">Delivery time is too long</option>
          <option value="Other reason">Other reason</option>
        </select>
        {error && <div className="form-error">{error}</div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Keep Order
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          loading={loading}
          style={{ backgroundColor: 'var(--color-danger)' }}
        >
          Confirm Cancellation
        </Button>
      </div>
    </Modal>
  );
};

export default CancelOrderModal;
