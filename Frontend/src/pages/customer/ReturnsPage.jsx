import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCcw, CheckCircle2, Clock, Truck, ShieldAlert } from 'lucide-react';
import { returnApi } from '../../api/returnApi';
import { refundApi } from '../../api/refundApi';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ReturnsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [returns, setReturns] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/returns');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [retRes, refRes] = await Promise.all([
          returnApi.getMyReturns(),
          refundApi.getMyRefunds(),
        ]);
        setReturns(retRes || []);
        setRefunds(refRes || []);
      } catch (err) {
        console.warn('Failed to load returns/refunds:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <Spinner center size="lg" />;
  }

  if (returns.length === 0 && refunds.length === 0) {
    return (
      <div className="section container">
        <EmptyState
          icon={RotateCcw}
          title="No Return or Refund Requests"
          description="You do not have any active return requests or processed refunds. Returns can be initiated from any delivered order."
          actionLabel="View Delivered Orders"
          onAction={() => navigate('/orders')}
        />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'REFUNDED':
      case 'CLOSED':
        return 'badge-success';
      case 'PICKUP_SCHEDULED':
      case 'PICKED_UP':
      case 'RECEIVED':
      case 'QUALITY_CHECK':
      case 'REFUND_INITIATED':
        return 'badge-info';
      case 'REJECTED':
        return 'badge-danger';
      case 'REQUESTED':
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Returns & Refund Center
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Track doorstep return pickups, quality inspection progress, and payment reimbursements.
          </p>
        </div>

        {/* Returns Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '1.25rem' }}>
            Active Return Requests ({returns.length})
          </h2>

          {returns.length === 0 ? (
            <div style={{ padding: '1.5rem', background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)' }}>
              No returns requested yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {returns.map((ret) => (
                <div
                  key={ret._id}
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '0.2rem' }}>
                        Return #{ret.returnNumber || ret._id}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Requested on {formatDate(ret.createdAt, true)}
                      </div>
                    </div>
                    <span className={`badge ${getStatusBadge(ret.status)}`}>
                      {ret.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Reason</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{ret.reason}</div>
                      {ret.description && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                          "{ret.description}"
                        </div>
                      )}
                    </div>

                    {ret.reverseShipmentId && (
                      <div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Reverse Pickup AWB</div>
                        <div style={{ fontWeight: 600, color: 'var(--color-gold-dark)' }}>{ret.reverseShipmentId}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refunds Section */}
        {refunds.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: '1.25rem' }}>
              Refund Audit Trail ({refunds.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {refunds.map((ref) => (
                <div
                  key={ref._id}
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 1.5rem',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                      Refund #{ref.refundNumber || ref._id}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Processed on {formatDate(ref.processedAt || ref.createdAt, true)} &bull; Method: {ref.method}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-success)' }}>
                      {formatCurrency(ref.amount)}
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      {ref.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnsPage;
