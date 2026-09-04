import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle2, RefreshCw, Check, AlertCircle } from 'lucide-react';
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
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Refund #</th>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Reimbursement Amount</th>
                <th>Mode</th>
                <th>Reason</th>
                <th>Disbursed Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((ref) => {
                const orderNum = ref.orderId?.orderNumber || (typeof ref.orderId === 'string' ? ref.orderId : 'N/A');
                const customerName = ref.userId?.name || ref.userId?.email || 'Customer';

                return (
                  <tr key={ref._id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {ref.refundNumber || ref._id}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      #{orderNum}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{customerName}</div>
                      {ref.userId?.email && ref.userId?.name && (
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {ref.userId.email}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-success)' }}>
                      {formatCurrency(ref.amount)}
                    </td>
                    <td>
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        {ref.method}
                      </span>
                      {ref.razorpayRefundId && (
                        <div style={{ fontSize: '0.65rem', color: '#6B7280', fontFamily: 'monospace', marginTop: '2px' }}>
                          {ref.razorpayRefundId}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#4B5563', maxWidth: '220px' }}>
                      {ref.reason}
                    </td>
                    <td>{formatDate(ref.processedAt || ref.createdAt, true)}</td>
                    <td>
                      <span
                        className={`badge ${
                          ['COMPLETED', 'SUCCESS'].includes(ref.status)
                            ? 'badge-success'
                            : ref.status === 'PROCESSING'
                            ? 'badge-warning'
                            : 'badge-secondary'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td>
                      {ref.status === 'PENDING' && (
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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

