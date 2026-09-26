import React, { useState, useEffect } from 'react';
import { RotateCcw, RefreshCw, DollarSign, Eye, User, ShoppingBag, Truck, Edit } from 'lucide-react';
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

  // Details Modal
  const [detailReturn, setDetailReturn] = useState(null);

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
      if (detailReturn && detailReturn._id === selectedReturn._id) {
        setDetailReturn({ ...detailReturn, status: newStatus, reverseShipmentId: reverseAwb });
      }
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
      if (detailReturn && detailReturn._id === ret._id) {
        setDetailReturn({ ...detailReturn, status: 'REFUND_INITIATED' });
      }
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
        <div className="admin-table-container refund-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Return</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Reverse AWB</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret) => {
                const returnNum = ret.returnNumber || ret._id || '';
                const orderNum = ret.orderId?.orderNumber || (typeof ret.orderId === 'string' ? ret.orderId : (ret.orderId?._id || 'N/A'));
                const customerName = ret.userId?.name || 'Customer';
                const customerContact = ret.userId?.email || ret.userId?.phone || '';
                const isReadyForRefund = ['RECEIVED', 'QUALITY_CHECK'].includes(ret.status);

                const truncatedReturn = returnNum.length > 14 ? `${returnNum.slice(0, 11)}...` : returnNum;
                const truncatedOrder = orderNum.length > 13 ? `${orderNum.slice(0, 10)}...` : orderNum;

                const statusBadgeClass = ['APPROVED', 'REFUNDED', 'CLOSED'].includes(ret.status)
                  ? 'badge-success'
                  : ret.status === 'REJECTED'
                  ? 'badge-danger'
                  : 'badge-warning';

                return (
                  <tr key={ret._id}>
                    <td>
                      <span className="refund-cell-code" title={returnNum}>
                        {truncatedReturn}
                      </span>
                      <span className="refund-date-cell" style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {formatDate(ret.createdAt, false)}
                      </span>
                    </td>

                    <td>
                      <span className="refund-cell-order" title={`#${orderNum}`}>
                        #{truncatedOrder}
                      </span>
                    </td>

                    <td>
                      <div className="refund-customer-compact">
                        <div className="refund-customer-name" title={customerName}>{customerName}</div>
                        {customerContact && (
                          <div className="refund-customer-email" title={customerContact}>{customerContact}</div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="refund-customer-name" title={ret.reason}>{ret.reason}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gold-dark)', marginTop: '2px' }}>
                        {ret.items?.length || 1} item(s) to return
                      </div>
                    </td>

                    <td>
                      {ret.reverseShipmentId ? (
                        <span className="refund-field-value-code" title={ret.reverseShipmentId}>
                          {ret.reverseShipmentId.length > 14 ? `${ret.reverseShipmentId.slice(0, 11)}...` : ret.reverseShipmentId}
                        </span>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontSize: '0.8rem', fontStyle: 'italic' }}>Not Assigned</span>
                      )}
                    </td>

                    <td>
                      <span className={`badge ${statusBadgeClass}`} style={{ fontSize: '0.7rem' }}>
                        {ret.status?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td>
                      <div className="refund-actions-cell">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDetailReturn(ret)}
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenModal(ret)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Update Status"
                        >
                          <Edit size={12} />
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

      {/* Details Modal */}
      <Modal
        isOpen={!!detailReturn}
        onClose={() => setDetailReturn(null)}
        title="Return Request Details"
        maxWidth="620px"
      >
        {detailReturn && (
          <div>
            {/* Hero Header */}
            <div className="refund-modal-hero">
              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--color-gold-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                  Return Request
                </div>
                <div className="refund-modal-amount" style={{ fontSize: '1.4rem' }}>
                  #{detailReturn.returnNumber || detailReturn._id}
                </div>
                <div className="refund-modal-sub">
                  Linked Order #{detailReturn.orderId?.orderNumber || (typeof detailReturn.orderId === 'string' ? detailReturn.orderId : (detailReturn.orderId?._id || 'N/A'))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                <span
                  className={`badge ${
                    ['APPROVED', 'REFUNDED', 'CLOSED'].includes(detailReturn.status)
                      ? 'badge-success'
                      : detailReturn.status === 'REJECTED'
                      ? 'badge-danger'
                      : 'badge-warning'
                  }`}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                >
                  {detailReturn.status?.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Requested {formatDate(detailReturn.createdAt, true)}
                </span>
              </div>
            </div>

            {/* Details Cards Grid */}
            <div className="refund-details-grid">
              {/* Return Info */}
              <div className="refund-detail-card">
                <div className="refund-card-title">
                  <RotateCcw size={14} />
                  <span>Return Request Info</span>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Return Reference</div>
                  <div className="refund-field-value-code">
                    {detailReturn.returnNumber || detailReturn._id}
                  </div>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Reason</div>
                  <div className="refund-field-value" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    {detailReturn.reason}
                  </div>
                </div>

                {detailReturn.description && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Customer Explanation</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem', color: '#4B5563', fontWeight: 500, fontStyle: 'italic' }}>
                      "{detailReturn.description}"
                    </div>
                  </div>
                )}
              </div>

              {/* Order & Customer */}
              <div className="refund-detail-card">
                <div className="refund-card-title">
                  <User size={14} />
                  <span>Order & Customer</span>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Order Reference</div>
                  <div className="refund-field-value-code">
                    #{detailReturn.orderId?.orderNumber || (typeof detailReturn.orderId === 'string' ? detailReturn.orderId : (detailReturn.orderId?._id || 'N/A'))}
                  </div>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Customer Name</div>
                  <div className="refund-field-value">
                    {detailReturn.userId?.name || 'Customer'}
                  </div>
                </div>

                {detailReturn.userId?.email && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Email</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem' }}>
                      {detailReturn.userId.email}
                    </div>
                  </div>
                )}

                {detailReturn.userId?.phone && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Phone</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem' }}>
                      {detailReturn.userId.phone}
                    </div>
                  </div>
                )}
              </div>

              {/* Reverse Logistics */}
              <div className="refund-detail-card" style={{ gridColumn: '1 / -1' }}>
                <div className="refund-card-title">
                  <Truck size={14} />
                  <span>Reverse Logistics Pickup</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="refund-field-item" style={{ margin: 0 }}>
                    <div className="refund-field-label">Reverse Shipment AWB</div>
                    <div className="refund-field-value-code" style={{ fontSize: '0.9rem' }}>
                      {detailReturn.reverseShipmentId || 'Not Assigned Yet'}
                    </div>
                  </div>

                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                    Status: {detailReturn.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Return Items List */}
              {detailReturn.items && detailReturn.items.length > 0 && (
                <div className="refund-detail-card" style={{ gridColumn: '1 / -1' }}>
                  <div className="refund-card-title">
                    <ShoppingBag size={14} />
                    <span>Returned Items ({detailReturn.items.length})</span>
                  </div>

                  <table className="admin-modal-items-table">
                    <thead>
                      <tr>
                        <th>Product ID / Item</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailReturn.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>
                            {typeof item.productId === 'object' ? (item.productId.title || item.productId._id) : (item.name || item.title || item.productId || 'Saree Item')}
                          </td>
                          <td style={{ fontWeight: 700 }}>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenModal(detailReturn)}
                >
                  <Edit size={12} />
                  <span>Update Return Status</span>
                </Button>

                {['RECEIVED', 'QUALITY_CHECK'].includes(detailReturn.status) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const targetRet = detailReturn;
                      setDetailReturn(null);
                      handleInitiateRefund(targetRet);
                    }}
                    loading={refundingId === detailReturn._id}
                    style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                  >
                    <DollarSign size={14} />
                    <span>Disburse Refund</span>
                  </Button>
                )}
              </div>

              <Button variant="secondary" size="sm" onClick={() => setDetailReturn(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
