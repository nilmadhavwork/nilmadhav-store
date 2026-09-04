import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, X, Truck, RefreshCw, DollarSign, Filter } from 'lucide-react';
import { returnApi } from '../../api/returnApi';
import { refundApi } from '../../api/refundApi';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';

export const AdminReturnsPage = () => {
  const { success, error: toastError } = useToast();

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Status update modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [newStatus, setNewStatus] = useState('APPROVED');
  const [reverseAwb, setReverseAwb] = useState('');
  const [updating, setUpdating] = useState(false);

  // Refund processing state
  const [refundingId, setRefundingId] = useState(null);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const data = await returnApi.getAllReturns(params);
      setReturns(Array.isArray(data) ? data : data?.returns || []);
    } catch (err) {
      console.warn('Failed to load return requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, [statusFilter]);

  const handleOpenModal = (ret) => {
    setSelectedReturn(ret);
    setNewStatus(ret.status || 'APPROVED');
    setReverseAwb(ret.reverseShipmentId || '');
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await returnApi.updateStatus(selectedReturn._id, newStatus, reverseAwb);
      success(`Return #${selectedReturn.returnNumber || selectedReturn._id} updated to ${newStatus}`);
      setModalOpen(false);
      loadReturns();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update return status');
    } finally {
      setUpdating(false);
    }
  };

  const handleInitiateRefund = async (ret) => {
    if (!window.confirm(`Initiate refund for return #${ret.returnNumber || ret._id}?`)) return;

    try {
      setRefundingId(ret._id);
      await refundApi.createRefund({ returnId: ret._id });
      success(`Refund initiated successfully for Return #${ret.returnNumber || ret._id}!`);
      loadReturns();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to initiate refund. Ensure original order was paid.');
    } finally {
      setRefundingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Customer Return Requests
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Review reasons, schedule reverse pickups, inspect items, and disburse refunds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.875rem' }}
          >
            <option value="">All Return Statuses</option>
            <option value="REQUESTED">REQUESTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PICKUP_SCHEDULED">PICKUP SCHEDULED</option>
            <option value="PICKED_UP">PICKED UP</option>
            <option value="RECEIVED">RECEIVED (Ready for QC/Refund)</option>
            <option value="QUALITY_CHECK">QUALITY CHECK</option>
            <option value="REFUND_INITIATED">REFUND INITIATED</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <Button variant="secondary" size="sm" onClick={loadReturns}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner center size="lg" />
      ) : returns.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB' }}>
          <RotateCcw size={36} color="var(--color-gold-dark)" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#6B7280' }}>No customer return requests found matching criteria.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Return #</th>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Items & Reason</th>
                <th>Reverse Pickup AWB</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret) => {
                const orderNum = ret.orderId?.orderNumber || (typeof ret.orderId === 'string' ? ret.orderId : 'N/A');
                const customerName = ret.userId?.name || 'Customer';
                const customerContact = ret.userId?.email || ret.userId?.phone || '';
                const isReadyForRefund = ['RECEIVED', 'QUALITY_CHECK'].includes(ret.status);

                return (
                  <tr key={ret._id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {ret.returnNumber || ret._id}
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 'normal' }}>
                        {formatDate(ret.createdAt, true)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      #{orderNum}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{customerName}</div>
                      {customerContact && (
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {customerContact}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ret.reason}</div>
                      {ret.description && (
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', maxWidth: '240px' }}>
                          "{ret.description}"
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gold-dark)', marginTop: '2px' }}>
                        {ret.items?.length || 1} item(s) to return
                      </div>
                    </td>
                    <td>
                      {ret.reverseShipmentId ? (
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-gold-dark)' }}>
                          {ret.reverseShipmentId}
                        </span>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Not Assigned</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ['APPROVED', 'REFUNDED', 'CLOSED'].includes(ret.status)
                            ? 'badge-success'
                            : ret.status === 'REJECTED'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {ret.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenModal(ret)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          Update Status
                        </Button>

                        {isReadyForRefund && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleInitiateRefund(ret)}
                            loading={refundingId === ret._id}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#059669', borderColor: '#059669' }}
                            title="Disburse customer refund"
                          >
                            <DollarSign size={12} />
                            <span>Initiate Refund</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review & Status Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Update Return #${selectedReturn?.returnNumber || selectedReturn?._id}`}
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Return Lifecycle Stage</label>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="REQUESTED">REQUESTED</option>
              <option value="APPROVED">APPROVED (Authorized for Return)</option>
              <option value="REJECTED">REJECTED (Does not meet policy)</option>
              <option value="PICKUP_SCHEDULED">PICKUP SCHEDULED</option>
              <option value="PICKED_UP">PICKED UP by Courier</option>
              <option value="RECEIVED">RECEIVED at Atelier (Ready for Refund)</option>
              <option value="QUALITY_CHECK">QUALITY CHECK in Progress (Ready for Refund)</option>
              <option value="REFUND_INITIATED">REFUND INITIATED</option>
              <option value="REFUNDED">REFUNDED & CLOSED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <Input
            label="Reverse Shipment Pickup AWB (Shiprocket / Courier)"
            value={reverseAwb}
            onChange={(e) => setReverseAwb(e.target.value)}
            placeholder="e.g. SR_REV_987123"
          />

          {['RECEIVED', 'QUALITY_CHECK'].includes(newStatus) && (
            <div style={{ padding: '0.75rem', backgroundColor: '#F0FDF4', borderRadius: '4px', fontSize: '0.8rem', color: '#166534', border: '1px solid #BBF7D0' }}>
              Tip: Once this return is marked as <strong>{newStatus}</strong>, you will be able to disburse the refund via Razorpay or manual bank transfer.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate} loading={updating}>
            Save Status
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminReturnsPage;

