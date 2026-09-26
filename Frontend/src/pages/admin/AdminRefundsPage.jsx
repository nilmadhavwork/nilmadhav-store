import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, RefreshCw, Check, AlertCircle, Eye, User, Calendar, FileText } from 'lucide-react';
import { refundApi } from '../../api/refundApi';
import { returnApi } from '../../api/returnApi';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminRefundsPage = () => {
  const { success, error: toastError } = useToast();

  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Eligible returns for processing new refund
  const [eligibleReturns, setEligibleReturns] = useState([]);
  const [selectedReturnId, setSelectedReturnId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [initiatingId, setInitiatingId] = useState(null);

  // Selected refund for details modal
  const [detailRefund, setDetailRefund] = useState(null);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const data = await refundApi.getAllRefunds();
      setRefunds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load refunds:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const handleOpenModal = async () => {
    setModalOpen(true);
    try {
      setLoadingReturns(true);
      const allReturns = await returnApi.getAllReturns();
      const returnsArr = Array.isArray(allReturns) ? allReturns : allReturns?.returns || [];
      // Backend requires return status to be RECEIVED or QUALITY_CHECK
      const eligible = returnsArr.filter((r) =>
        ['RECEIVED', 'QUALITY_CHECK'].includes(r.status)
      );
      setEligibleReturns(eligible);
      if (eligible.length > 0) {
        setSelectedReturnId(eligible[0]._id);
      }
    } catch (err) {
      console.warn('Failed to load eligible returns:', err.message);
    } finally {
      setLoadingReturns(false);
    }
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!selectedReturnId) {
      return toastError('Please select an eligible return request to refund.');
    }

    try {
      setProcessing(true);
      await refundApi.createRefund({ returnId: selectedReturnId });
      success('Customer refund initiated successfully!');
      setModalOpen(false);
      loadRefunds();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to process refund. Ensure the order was confirmed as paid.');
    } finally {
      setProcessing(false);
    }
  };

  const handleInitiateRefund = async (refund) => {
    try {
      setInitiatingId(refund._id);
      const res = await refundApi.initiateScheduledRefund(refund._id);
      success(res?.message || `Refund initiated successfully for #${refund.refundNumber || refund._id}!`);
      loadRefunds();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to initiate refund.');
    } finally {
      setInitiatingId(null);
    }
  };

  const handleCompleteRefund = async (refund) => {
    try {
      setCompletingId(refund._id);
      await refundApi.completeRefund(refund._id, refund.method || 'BANK_TRANSFER');
      success(`Refund #${refund.refundNumber || refund._id} marked as completed!`);
      loadRefunds();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to complete refund.');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Payment Refunds & Disbursements
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Live audit trail of customer reimbursements via Razorpay and manual bank transfers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={loadRefunds}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" onClick={handleOpenModal}>
            <Plus size={18} />
            <span>Process New Refund</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner center size="lg" />
      ) : refunds.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB' }}>
          <CreditCard size={36} color="var(--color-gold-dark)" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#6B7280', marginBottom: '1.25rem' }}>No refund records logged yet.</p>
          <Button variant="primary" size="sm" onClick={handleOpenModal}>
            Record First Refund
          </Button>
        </div>
      ) : (
        <div className="admin-table-container refund-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Refund</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((ref) => {
                const refundNum = ref.refundNumber || ref._id || '';
                const orderNum = ref.orderId?.orderNumber || (typeof ref.orderId === 'string' ? ref.orderId : (ref.orderId?._id || 'N/A'));
                const customerName = ref.userId?.name || ref.userId?.email || 'Customer';
                const customerEmail = ref.userId?.email && ref.userId?.name ? ref.userId.email : '';

                // Compact truncation helpers
                const truncatedRefund = refundNum.length > 14 ? `${refundNum.slice(0, 11)}...` : refundNum;
                const truncatedOrder = orderNum.length > 13 ? `${orderNum.slice(0, 10)}...` : orderNum;

                // Format Method String
                const formattedMethod = ref.method === 'RAZORPAY'
                  ? 'Razorpay'
                  : ref.method === 'BANK_TRANSFER'
                  ? 'Bank Transfer'
                  : ref.method === 'UPI'
                  ? 'UPI'
                  : (ref.method || 'N/A');

                // Status badge styling
                const statusBadgeClass = ['COMPLETED', 'SUCCESS'].includes(ref.status)
                  ? 'badge-success'
                  : ref.status === 'PROCESSING'
                  ? 'badge-warning'
                  : ref.status === 'PENDING'
                  ? 'badge-gold'
                  : 'badge-danger';

                return (
                  <tr key={ref._id}>
                    <td>
                      <span className="refund-cell-code" title={refundNum}>
                        {truncatedRefund}
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
                        {customerEmail && (
                          <div className="refund-customer-email" title={customerEmail}>{customerEmail}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="refund-amount-cell">
                        {formatCurrency(ref.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        {formattedMethod}
                      </span>
                    </td>
                    <td>
                      <span className="refund-date-cell">
                        {formatDate(ref.processedAt || ref.createdAt, false)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusBadgeClass}`} style={{ fontSize: '0.7rem' }}>
                        {ref.status}
                      </span>
                    </td>
                    <td>
                      <div className="refund-actions-cell">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDetailRefund(ref)}
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </Button>

                        {ref.status === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleInitiateRefund(ref)}
                            loading={initiatingId === ref._id}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#5B1527', borderColor: '#5B1527' }}
                            title="Initiate refund processing"
                          >
                            <RefreshCw size={12} />
                            <span>Initiate</span>
                          </Button>
                        )}

                        {(ref.status === 'PROCESSING' || (ref.status === 'PENDING' && ref.method === 'BANK_TRANSFER')) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCompleteRefund(ref)}
                            loading={completingId === ref._id}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#059669', borderColor: '#059669' }}
                            title="Mark manual transfer completed"
                          >
                            <Check size={12} />
                            <span>Mark Paid</span>
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
        isOpen={!!detailRefund}
        onClose={() => setDetailRefund(null)}
        title="Refund Details"
        maxWidth="620px"
      >
        {detailRefund && (
          <div>
            {/* Modal Hero Header */}
            <div className="refund-modal-hero">
              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--color-gold-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                  Reimbursement Amount
                </div>
                <div className="refund-modal-amount">
                  {formatCurrency(detailRefund.amount)}
                </div>
                <div className="refund-modal-sub">
                  Refund #{detailRefund.refundNumber || detailRefund._id}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                <span
                  className={`badge ${
                    ['COMPLETED', 'SUCCESS'].includes(detailRefund.status)
                      ? 'badge-success'
                      : detailRefund.status === 'PROCESSING'
                      ? 'badge-warning'
                      : detailRefund.status === 'PENDING'
                      ? 'badge-gold'
                      : 'badge-danger'
                  }`}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                >
                  {detailRefund.status}
                </span>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                  {detailRefund.method === 'RAZORPAY' ? 'Razorpay' : detailRefund.method === 'BANK_TRANSFER' ? 'Bank Transfer' : detailRefund.method === 'UPI' ? 'UPI' : (detailRefund.method || 'N/A')}
                </span>
              </div>
            </div>

            {/* Logical Information Cards Grid */}
            <div className="refund-details-grid">
              {/* Refund Information */}
              <div className="refund-detail-card">
                <div className="refund-card-title">
                  <CreditCard size={14} />
                  <span>Refund Information</span>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Refund Number</div>
                  <div className="refund-field-value-code">
                    {detailRefund.refundNumber || detailRefund._id}
                  </div>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Amount</div>
                  <div className="refund-field-value" style={{ color: 'var(--color-success)' }}>
                    {formatCurrency(detailRefund.amount)}
                  </div>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Status</div>
                  <div className="refund-field-value">
                    {detailRefund.status}
                  </div>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Method</div>
                  <div className="refund-field-value">
                    {detailRefund.method || 'N/A'}
                  </div>
                </div>

                {detailRefund.reason && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Reason</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem', color: '#4B5563', fontWeight: 500 }}>
                      {detailRefund.reason}
                    </div>
                  </div>
                )}
              </div>

              {/* Order & Payment References */}
              <div className="refund-detail-card">
                <div className="refund-card-title">
                  <FileText size={14} />
                  <span>Order & Payment Info</span>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Order ID</div>
                  <div className="refund-field-value-code">
                    #{detailRefund.orderId?.orderNumber || (typeof detailRefund.orderId === 'string' ? detailRefund.orderId : (detailRefund.orderId?._id || 'N/A'))}
                  </div>
                </div>

                {detailRefund.paymentId && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Payment ID</div>
                    <div className="refund-field-value-code">
                      {typeof detailRefund.paymentId === 'object' ? (detailRefund.paymentId._id || detailRefund.paymentId.razorpayPaymentId || 'N/A') : detailRefund.paymentId}
                    </div>
                  </div>
                )}

                {detailRefund.returnId && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Return ID</div>
                    <div className="refund-field-value-code">
                      {typeof detailRefund.returnId === 'object' ? (detailRefund.returnId.returnNumber || detailRefund.returnId._id) : detailRefund.returnId}
                    </div>
                  </div>
                )}

                {detailRefund.razorpayRefundId && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Razorpay Refund ID</div>
                    <div className="refund-field-value-code" style={{ backgroundColor: '#FAF5EB', color: 'var(--color-gold-dark)', fontWeight: 700 }}>
                      {detailRefund.razorpayRefundId}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="refund-detail-card">
                <div className="refund-card-title">
                  <User size={14} />
                  <span>Customer Information</span>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Customer</div>
                  <div className="refund-field-value">
                    {detailRefund.userId?.name || 'Customer'}
                  </div>
                </div>

                {detailRefund.userId?.email && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Email</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem' }}>
                      {detailRefund.userId.email}
                    </div>
                  </div>
                )}

                {detailRefund.userId?.phone && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Phone</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem' }}>
                      {detailRefund.userId.phone}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Information */}
              <div className="refund-detail-card">
                <div className="refund-card-title">
                  <Calendar size={14} />
                  <span>Date Information</span>
                </div>

                {detailRefund.createdAt && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Created At</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem' }}>
                      {formatDate(detailRefund.createdAt, true)}
                    </div>
                  </div>
                )}

                {detailRefund.scheduledAt && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Scheduled At</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem', color: new Date() < new Date(detailRefund.scheduledAt) ? '#b45309' : '#059669' }}>
                      {formatDate(detailRefund.scheduledAt, true)}
                    </div>
                  </div>
                )}

                {detailRefund.processedAt && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Processed At</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem', color: 'var(--color-success)' }}>
                      {formatDate(detailRefund.processedAt, true)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {detailRefund.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const targetRef = detailRefund;
                      setDetailRefund(null);
                      handleInitiateRefund(targetRef);
                    }}
                    loading={initiatingId === detailRefund._id}
                    style={{ backgroundColor: '#5B1527', borderColor: '#5B1527' }}
                  >
                    <RefreshCw size={14} />
                    <span>Initiate Refund</span>
                  </Button>
                )}

                {(detailRefund.status === 'PROCESSING' || (detailRefund.status === 'PENDING' && detailRefund.method === 'BANK_TRANSFER')) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const targetRef = detailRefund;
                      setDetailRefund(null);
                      handleCompleteRefund(targetRef);
                    }}
                    loading={completingId === detailRefund._id}
                    style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                  >
                    <Check size={14} />
                    <span>Mark Paid</span>
                  </Button>
                )}
              </div>

              <Button variant="secondary" size="sm" onClick={() => setDetailRefund(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Process Refund Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Initiate Customer Refund"
        maxWidth="500px"
      >
        <form onSubmit={handleProcessRefund}>
          {loadingReturns ? (
            <Spinner center size="sm" />
          ) : eligibleReturns.length === 0 ? (
            <div style={{ padding: '1.25rem', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', border: '1px solid #FCD34D', color: '#92400E' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <AlertCircle size={18} />
                <span>No Eligible Returns Found</span>
              </div>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                To initiate a refund, a return request must first be in <strong>RECEIVED</strong> or <strong>QUALITY CHECK</strong> status. Please inspect and update return requests in the Return Requests tab first.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Select Received Return Request <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedReturnId}
                  onChange={(e) => setSelectedReturnId(e.target.value)}
                  required
                >
                  {eligibleReturns.map((ret) => (
                    <option key={ret._id} value={ret._id}>
                      Return #{ret.returnNumber || ret._id} (Order #{ret.orderId?.orderNumber || 'N/A'}) - {ret.reason}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '4px', border: '1px solid #E5E7EB', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
                  Automated Calculation:
                </div>
                <div style={{ color: '#4B5563' }}>
                  The backend automatically calculates the exact refund amount from the returned saree items, triggers the Razorpay refund API if paid online, or logs a pending bank transfer for COD orders.
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">
              Close
            </Button>
            {eligibleReturns.length > 0 && (
              <Button variant="primary" type="submit" loading={processing}>
                Authorize & Disburse
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRefundsPage;
