import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Edit, Check, RefreshCw, Eye, ShoppingBag, User, FileText } from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { ORDER_STATUSES, SHIPPING_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from '../../utils/formatters';

export const AdminOrdersPage = () => {
  const { success, error: toastError } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Details Modal
  const [detailOrder, setDetailOrder] = useState(null);

  // Status Update Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('PENDING');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Shiprocket Shipping Modal
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    shipmentId: '',
    awbCode: '',
    courierName: 'Delhivery Surface',
    trackingUrl: '',
    status: 'CREATED',
  });
  const [updatingShipping, setUpdatingShipping] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.orderStatus = statusFilter;
      const res = await orderApi.getAllOrders(params);
      setOrders(res?.orders || []);
    } catch (err) {
      console.warn('Failed to load admin orders:', err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Open Status Update Modal
  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.orderStatus);
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      await orderApi.updateStatus(selectedOrder._id, newOrderStatus);
      success(`Order #${selectedOrder.orderNumber} status updated to ${newOrderStatus}`);
      setStatusModalOpen(false);
      if (detailOrder && detailOrder._id === selectedOrder._id) {
        setDetailOrder({ ...detailOrder, orderStatus: newOrderStatus });
      }
      loadOrders();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Open Shiprocket Shipping Modal
  const handleOpenShippingModal = (order) => {
    setSelectedOrder(order);
    const ship = order.shipping || {};
    setShippingForm({
      shipmentId: ship.shipmentId || `SR_${Date.now()}`,
      awbCode: ship.awbCode || '',
      courierName: ship.courierName || 'Delhivery Surface',
      trackingUrl: ship.trackingUrl || '',
      status: ship.status || 'CREATED',
    });
    setShippingModalOpen(true);
  };

  const handleUpdateShipping = async () => {
    try {
      setUpdatingShipping(true);
      await orderApi.updateShipping(selectedOrder._id, shippingForm);
      success(`Shiprocket tracking updated for order #${selectedOrder.orderNumber}`);
      setShippingModalOpen(false);
      if (detailOrder && detailOrder._id === selectedOrder._id) {
        setDetailOrder({ ...detailOrder, shipping: { ...shippingForm } });
      }
      loadOrders();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update shipping details');
    } finally {
      setUpdatingShipping(false);
    }
  };

  const handleConfirmCod = async (order) => {
    try {
      await paymentApi.confirmCodPayment(order._id);
      success(`COD payment confirmed for order #${order.orderNumber}`);
      if (detailOrder && detailOrder._id === order._id) {
        setDetailOrder({ ...detailOrder, paymentStatus: 'PAID' });
      }
      loadOrders();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to confirm COD payment');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Orders & Logistics Fulfillment
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Process customer saree orders, update status lifecycles, and input Shiprocket courier tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.875rem' }}
          >
            <option value="">All Order Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <Button variant="secondary" size="sm" onClick={loadOrders}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <Spinner center size="lg" />
      ) : orders.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280' }}>No orders found matching the filter criteria.</p>
        </div>
      ) : (
        <div className="admin-table-container refund-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items & Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Shiprocket Courier</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const ship = order.shipping || {};
                const orderNum = order.orderNumber || order._id || '';
                const customerName = order.userId?.name || order.shippingAddress?.fullName || 'Customer';
                const customerContact = order.userId?.email || order.shippingAddress?.phone || '';

                const truncatedOrder = orderNum.length > 13 ? `${orderNum.slice(0, 10)}...` : orderNum;

                return (
                  <tr key={order._id}>
                    <td>
                      <span className="refund-cell-order" title={`#${orderNum}`}>
                        #{truncatedOrder}
                      </span>
                      <span className="refund-date-cell" style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {formatDate(order.createdAt, false)}
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
                      <div className="refund-amount-cell" style={{ color: 'var(--color-text)' }}>
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {order.items?.length || 0} saree(s)
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${getPaymentStatusBadge(order.paymentStatus)}`} style={{ fontSize: '0.7rem' }}>
                        {order.paymentStatus}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                        Mode: {order.paymentMethod}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${getOrderStatusBadge(order.orderStatus)}`} style={{ fontSize: '0.7rem' }}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td>
                      {ship.awbCode ? (
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                            {ship.courierName || 'Shiprocket'}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#6B7280', fontFamily: 'monospace' }}>
                            AWB: {ship.awbCode}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                          Not Dispatched
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="refund-actions-cell">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDetailOrder(order)}
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenStatusModal(order)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Update Status"
                        >
                          <Edit size={12} />
                        </Button>

                        <Button
                          variant="outline-gold"
                          size="sm"
                          onClick={() => handleOpenShippingModal(order)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Shiprocket Logistics"
                        >
                          <Truck size={12} />
                        </Button>

                        {order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirmCod(order)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#059669', borderColor: '#059669' }}
                            title="Confirm cash received"
                          >
                            <Check size={12} />
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
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title="Order Details"
        maxWidth="660px"
      >
        {detailOrder && (
          <div>
            {/* Hero Banner */}
            <div className="refund-modal-hero">
              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--color-gold-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                  Total Order Value
                </div>
                <div className="refund-modal-amount">
                  {formatCurrency(detailOrder.totalAmount)}
                </div>
                <div className="refund-modal-sub">
                  Order #{detailOrder.orderNumber}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                <span className={`badge ${getOrderStatusBadge(detailOrder.orderStatus)}`} style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>
                  Order: {detailOrder.orderStatus}
                </span>
                <span className={`badge ${getPaymentStatusBadge(detailOrder.paymentStatus)}`} style={{ fontSize: '0.75rem' }}>
                  Payment: {detailOrder.paymentStatus} ({detailOrder.paymentMethod})
                </span>
              </div>
            </div>

            {/* Grid Breakdown */}
            <div className="refund-details-grid">
              {/* Summary */}
              <div className="refund-detail-card">
                <div className="refund-card-title">
                  <FileText size={14} />
                  <span>Order Summary</span>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Order Number</div>
                  <div className="refund-field-value-code">
                    #{detailOrder.orderNumber}
                  </div>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Placed At</div>
                  <div className="refund-field-value" style={{ fontSize: '0.825rem' }}>
                    {formatDate(detailOrder.createdAt, true)}
                  </div>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Total Amount</div>
                  <div className="refund-field-value" style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                    {formatCurrency(detailOrder.totalAmount)}
                  </div>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Payment Mode</div>
                  <div className="refund-field-value">
                    {detailOrder.paymentMethod}
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Address */}
              <div className="refund-detail-card">
                <div className="refund-card-title">
                  <User size={14} />
                  <span>Customer & Shipping Address</span>
                </div>

                <div className="refund-field-item">
                  <div className="refund-field-label">Recipient Name</div>
                  <div className="refund-field-value" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    {detailOrder.shippingAddress?.fullName || detailOrder.userId?.name || 'Customer'}
                  </div>
                </div>

                {(detailOrder.userId?.email || detailOrder.shippingAddress?.email) && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Email</div>
                    <div className="refund-field-value" style={{ fontSize: '0.825rem' }}>
                      {detailOrder.userId?.email || detailOrder.shippingAddress?.email}
                    </div>
                  </div>
                )}

                {(detailOrder.shippingAddress?.phone || detailOrder.userId?.phone) && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Phone Contact</div>
                    <div className="refund-field-value" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {detailOrder.shippingAddress?.phone || detailOrder.userId?.phone}
                    </div>
                  </div>
                )}

                {detailOrder.shippingAddress && (
                  <div className="refund-field-item">
                    <div className="refund-field-label">Full Delivery Address (Shiprocket Ready)</div>
                    <div style={{ backgroundColor: '#FAF5EB', border: '1px solid var(--color-gold-border)', borderRadius: '4px', padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: '#1F2937', lineHeight: 1.5, marginTop: '0.25rem' }}>
                      <div style={{ fontWeight: 600 }}>
                        {[
                          detailOrder.shippingAddress.addressLine1,
                          detailOrder.shippingAddress.addressLine2,
                          detailOrder.shippingAddress.street,
                          detailOrder.shippingAddress.addressLine,
                          detailOrder.shippingAddress.landmark,
                        ].filter(Boolean).join(', ') || 'Street address not provided'}
                      </div>
                      <div>
                        {[
                          detailOrder.shippingAddress.city,
                          detailOrder.shippingAddress.state,
                        ].filter(Boolean).join(', ')}
                        {detailOrder.shippingAddress.pincode ? ` - ${detailOrder.shippingAddress.pincode}` : ''}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.15rem' }}>
                        {detailOrder.shippingAddress.country || 'India'}
                      </div>
                    </div>
                  </div>
                )}
              </div>


              {/* Logistics & Shiprocket */}
              <div className="refund-detail-card" style={{ gridColumn: '1 / -1' }}>
                <div className="refund-card-title">
                  <Truck size={14} />
                  <span>Shiprocket Logistics</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div className="refund-field-item">
                    <div className="refund-field-label">Courier Partner</div>
                    <div className="refund-field-value">
                      {detailOrder.shipping?.courierName || 'Not Assigned'}
                    </div>
                  </div>

                  <div className="refund-field-item">
                    <div className="refund-field-label">AWB Tracking Code</div>
                    <div className="refund-field-value-code">
                      {detailOrder.shipping?.awbCode || 'N/A'}
                    </div>
                  </div>

                  <div className="refund-field-item">
                    <div className="refund-field-label">Shipment Status</div>
                    <div className="refund-field-value">
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        {detailOrder.shipping?.status?.replace(/_/g, ' ') || 'NOT CREATED'}
                      </span>
                    </div>
                  </div>

                  {detailOrder.shipping?.trackingUrl && (
                    <div className="refund-field-item">
                      <div className="refund-field-label">Tracking URL</div>
                      <a
                        href={detailOrder.shipping.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}
                      >
                        Open Shiprocket Tracking →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="refund-detail-card" style={{ gridColumn: '1 / -1' }}>
                <div className="refund-card-title">
                  <ShoppingBag size={14} />
                  <span>Ordered Saree Items ({detailOrder.items?.length || 0})</span>
                </div>

                <table className="admin-modal-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailOrder.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>
                          {item.title || item.name || item.productId?.title || 'Luxury Saree'}
                        </td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenStatusModal(detailOrder)}
                >
                  <Edit size={12} />
                  <span>Update Order Status</span>
                </Button>

                <Button
                  variant="outline-gold"
                  size="sm"
                  onClick={() => handleOpenShippingModal(detailOrder)}
                >
                  <Truck size={12} />
                  <span>Shiprocket Logistics</span>
                </Button>

                {detailOrder.paymentMethod === 'COD' && detailOrder.paymentStatus === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConfirmCod(detailOrder)}
                    style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                  >
                    <Check size={12} />
                    <span>Confirm COD Paid</span>
                  </Button>
                )}
              </div>

              <Button variant="secondary" size="sm" onClick={() => setDetailOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 1: Update Order Lifecycle Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Order Status (#${selectedOrder?.orderNumber})`}
        maxWidth="440px"
      >
        <div className="form-group">
          <label className="form-label">Select Lifecycle Status</label>
          <select
            className="form-select"
            value={newOrderStatus}
            onChange={(e) => setNewOrderStatus(e.target.value)}
          >
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus} loading={updatingStatus}>
            Save Status
          </Button>
        </div>
      </Modal>

      {/* Modal 2: Shiprocket Fulfillment Details */}
      <Modal
        isOpen={shippingModalOpen}
        onClose={() => setShippingModalOpen(false)}
        title={`Shiprocket Logistics (#${selectedOrder?.orderNumber})`}
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Shiprocket Shipment ID"
            value={shippingForm.shipmentId}
            onChange={(e) => setShippingForm({ ...shippingForm, shipmentId: e.target.value })}
            placeholder="e.g. SR_9876543"
          />

          <Input
            label="AWB Tracking Code"
            required
            value={shippingForm.awbCode}
            onChange={(e) => setShippingForm({ ...shippingForm, awbCode: e.target.value })}
            placeholder="e.g. 143289081290"
          />

          <Input
            label="Courier Partner Name"
            value={shippingForm.courierName}
            onChange={(e) => setShippingForm({ ...shippingForm, courierName: e.target.value })}
            placeholder="e.g. Delhivery Surface, BlueDart Express"
          />

          <Input
            label="Public Tracking URL"
            value={shippingForm.trackingUrl}
            onChange={(e) => setShippingForm({ ...shippingForm, trackingUrl: e.target.value })}
            placeholder="https://shiprocket.co/tracking/..."
          />

          <div className="form-group">
            <label className="form-label">Shipment Lifecycle Status</label>
            <select
              className="form-select"
              value={shippingForm.status}
              onChange={(e) => setShippingForm({ ...shippingForm, status: e.target.value })}
            >
              {SHIPPING_STATUSES.map((st) => (
                <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <Button variant="secondary" onClick={() => setShippingModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateShipping} loading={updatingShipping}>
            Update Logistics Info
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
