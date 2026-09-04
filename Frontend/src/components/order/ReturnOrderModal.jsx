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
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reason, setReason] = useState('Color mismatch with website photos');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const items = order?.items || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const prodId = selectedProductId || items[0]?.productId;
    if (!prodId) {
      setError('Please select a saree to return');
      return;
    }
    if (!reason) {
      setError('Please select a return reason');
      return;
    }

    const selectedItem = items.find((i) => (i.productId?._id || i.productId) === prodId) || items[0];

    onSubmitReturn({
      orderId: order._id,
      items: [
        {
          productId: selectedItem.productId?._id || selectedItem.productId,
          quantity: 1,
          reason,
        },
      ],
      reason,
      description,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Return & Refund"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--color-gold-bg)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
          <RotateCcw size={20} color="var(--color-gold-dark)" />
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            7-Day Easy Return Policy: Saree must be unworn with original tags and blouse piece intact.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Select Product to Return <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            {items.map((item, idx) => {
              const id = item.productId?._id || item.productId || idx;
              return (
                <option key={id} value={id}>
                  {item.productName} (Qty: {item.quantity})
                </option>
              );
            })}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Reason for Return <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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
          />
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Submit Return Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReturnOrderModal;
