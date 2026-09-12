import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { RotateCcw } from 'lucide-react';

export const ReturnOrderModal = ({
  isOpen,
  onClose,
  order,
  onSubmitReturn,
  loading = false,
  existingReturns = [],
}) => {
  const [reason, setReason] = useState('Color mismatch with website photos');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const activeReturns = (existingReturns || []).filter((r) => r.status !== 'REJECTED');
  const hasExistingReturn = activeReturns.length > 0;
  const items = order?.items || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (hasExistingReturn) {
      setError('A return request has already been submitted for this order.');
      return;
    }

    if (!reason) {
      setError('Please select a return reason');
      return;
    }

    onSubmitReturn({
      orderId: order._id,
      items: items.map((item) => ({
        productId: item.productId?._id || item.productId,
        quantity: item.quantity,
        reason,
      })),
      reason,
      description,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Order Return & Refund"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--color-gold-bg)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
          <RotateCcw size={20} color="var(--color-gold-dark)" />
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            7-Day Easy Return Policy: Return applies to the entire order. Items must be unworn with original tags intact.
          </div>
        </div>

        {hasExistingReturn ? (
          <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            A return request (#{activeReturns[0].returnNumber}) has already been submitted for Order #{order?.orderNumber}. Status: <strong>{activeReturns[0].status.replace(/_/g, ' ')}</strong>.
          </div>
        ) : (
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
              Items included in this return ({items.length}):
            </label>
            <div style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', maxHeight: '140px', overflowY: 'auto' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0', borderBottom: idx < items.length - 1 ? '1px dashed var(--color-border-subtle)' : 'none' }}>
                  <span>{item.productName}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            Reason for Return <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={hasExistingReturn}
          >
            <option value="Color mismatch with website photos">Color mismatch with website photos</option>
            <option value="Defective / damaged zari or fabric">Defective / damaged zari or fabric</option>
            <option value="Fabric quality different than expected">Fabric quality different than expected</option>
            <option value="Incorrect saree received">Incorrect saree received</option>
            <option value="Blouse piece missing/defective">Blouse piece missing/defective</option>
            <option value="Other">Other reason</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Additional Comments / Details</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Please share any specific details about the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={hasExistingReturn}
          />
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} disabled={hasExistingReturn}>
            Submit Return Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReturnOrderModal;
