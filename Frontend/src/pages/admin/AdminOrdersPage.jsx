import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Edit, Check, Filter, ExternalLink, RefreshCw } from 'lucide-react';
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
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer & Phone</th>
                <th>Items & Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Shiprocket Courier Info</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const ship = order.shipping || {};

                return (
                  <tr key={order._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        {order.orderNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {formatDate(order.createdAt, true)}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {order.userId?.name || order.shippingAddress?.fullName || 'Customer'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                        {order.userId?.email || order.shippingAddress?.phone}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {order.items?.length || 0} saree(s)
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                        Mode: {order.paymentMethod}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${getOrderStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td>
                      {ship.awbCode ? (
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                            {ship.courierName || 'Shiprocket'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>
                            AWB: {ship.awbCode}
                          </div>
                          <span className="badge badge-gold" style={{ fontSize: '0.65rem', marginTop: '2px' }}>
                            {ship.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                          Not Dispatched
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenStatusModal(order)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          <Edit size={12} />
                          <span>Status</span>
                        </Button>

                        <Button
                          variant="outline-gold"
                          size="sm"
                          onClick={() => handleOpenShippingModal(order)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          <Truck size={12} />
                          <span>Shiprocket</span>
                        </Button>

                        {order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirmCod(order)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#059669', borderColor: '#059669' }}
                            title="Confirm cash received from courier"
                          >
                            <Check size={12} />
                            <span>Confirm COD</span>
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
