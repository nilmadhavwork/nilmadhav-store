import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  RotateCcw,
  XCircle,
  FileText,
} from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import { returnApi } from '../../api/returnApi';
import { useToast } from '../../context/ToastContext';
import OrderTimeline from '../../components/order/OrderTimeline';
import CancelOrderModal from '../../components/order/CancelOrderModal';
import ReturnOrderModal from '../../components/order/ReturnOrderModal';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from '../../utils/formatters';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.warn('Failed to load order details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Handle Cancellation
  const handleCancelOrder = async (reason) => {
    try {
      setCancelling(true);
      const updatedOrder = await orderApi.cancelOrder(order._id, reason);
      setOrder(updatedOrder);
      setCancelModalOpen(false);
      success('Order has been cancelled successfully.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  // Handle Return Submission
  const handleReturnSubmit = async (returnData) => {
    try {
      setSubmittingReturn(true);
      await returnApi.createReturn(returnData);
      setReturnModalOpen(false);
      success('Return request submitted successfully. Our team will review it within 24 hours.');
      navigate('/returns');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return <Spinner center size="lg" />;
  }

  if (!order) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
        <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>Order Not Found</h2>
        <Link to="/orders" className="btn btn-primary">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const {
    orderNumber,
    createdAt,
    orderStatus,
    paymentStatus,
    paymentMethod,
    subtotal,
    shippingCost,
    totalAmount,
    shippingAddress = {},
    shipping = {},
    items = [],
  } = order;

  // Cancellation is permitted only before dispatch
  const canCancel = ['PENDING', 'CONFIRMED', 'PACKED'].includes(orderStatus);
  // Return is permitted once delivered
  const canReturn = orderStatus === 'DELIVERED';

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Navigation & Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Orders</span>
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '1.25rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)' }}>
                  Order #{orderNumber}
                </h1>
                <span className={`badge ${getOrderStatusBadge(orderStatus)}`}>
                  {orderStatus}
                </span>
                <span className={`badge ${getPaymentStatusBadge(paymentStatus)}`}>
                  {paymentStatus}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Ordered on {formatDate(createdAt, true)} &bull; Payment via {paymentMethod}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelModalOpen(true)}
                  style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                >
                  <XCircle size={15} />
                  <span>Cancel Order</span>
                </Button>
              )}

              {canReturn && (
                <Button
                  variant="outline-gold"
                  size="sm"
                  onClick={() => setReturnModalOpen(true)}
                >
                  <RotateCcw size={15} />
                  <span>Request Return</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Shiprocket Fulfillment Visual Timeline */}
        <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.75rem', marginBottom: '2rem', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
            Shiprocket Logistics Progress
          </h3>
          <OrderTimeline orderStatus={orderStatus} shipping={shipping} />
        </div>

        {/* Two-Column Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Shipping Address */}
          <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
              <MapPin size={18} />
              <h3 style={{ fontSize: '1.15rem' }}>Delivery Address</h3>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              {shippingAddress.fullName}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
              <div>{shippingAddress.addressLine1}</div>
              {shippingAddress.addressLine2 && <div>{shippingAddress.addressLine2}</div>}
              <div>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</div>
              <div>{shippingAddress.country || 'India'}</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Contact: {shippingAddress.phone}
            </div>
          </div>

          {/* Payment & Billing Summary */}
          <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
              <CreditCard size={18} />
              <h3 style={{ fontSize: '1.15rem' }}>Payment Summary</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Payment Mode</span>
              <span style={{ fontWeight: 600 }}>{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Items Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Shipping Charges</span>
              <span style={{ fontWeight: 600, color: shippingCost === 0 ? 'var(--color-success)' : 'inherit' }}>
                {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: '0.75rem', fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              <span>Total Paid / Payable</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.75rem', boxShadow: 'var(--shadow-xs)' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem' }}>
            Ordered Items ({items.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  borderBottom: idx < items.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  paddingBottom: idx < items.length - 1 ? '1.25rem' : '0',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80'}
                    alt={item.productName}
                    style={{ width: '65px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                      {item.productName}
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      SKU: {item.sku || 'N/A'} &bull; Qty: <strong>{item.quantity}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    {formatCurrency(item.total || item.price * item.quantity)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {formatCurrency(item.price)} each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirmCancel={handleCancelOrder}
        orderNumber={orderNumber}
        loading={cancelling}
      />

      {/* Return Request Modal */}
      <ReturnOrderModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        order={order}
        onSubmitReturn={handleReturnSubmit}
        loading={submittingReturn}
      />
    </div>
  );
};

export default OrderDetailPage;
