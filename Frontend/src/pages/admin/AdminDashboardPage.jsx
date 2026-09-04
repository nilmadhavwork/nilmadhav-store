import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  IndianRupee,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { orderApi } from '../../api/orderApi';
import { productApi } from '../../api/productApi';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from '../../utils/formatters';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [dashStats, ordersRes, prodsRes] = await Promise.all([
          adminApi.getDashboardStats(),
          orderApi.getAllOrders({ limit: 5 }),
          productApi.getAll({ limit: 1 }),
        ]);

        setStats({
          ...dashStats,
          totalProducts: prodsRes?.totalResults || dashStats.totalProducts,
          totalOrders: ordersRes?.totalResults || dashStats.totalOrders,
        });

        setRecentOrders(ordersRes?.orders || []);
      } catch (err) {
        console.warn('Failed to load admin dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <Spinner center size="lg" />;
  }

  const metricCards = [
    {
      label: 'Total Sarees in Catalog',
      value: stats.totalProducts,
      icon: Boxes,
      bgColor: '#EFF6FF',
      iconColor: '#1D4ED8',
      link: '/admin/products',
    },
    {
      label: 'All-Time Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      bgColor: '#FDF4FF',
      iconColor: '#A21CAF',
      link: '/admin/orders',
    },
    {
      label: 'Pending Fulfillment',
      value: stats.pendingOrders,
      icon: Clock,
      bgColor: '#FEF3C7',
      iconColor: '#B45309',
      link: '/admin/orders?status=PENDING',
    },
    {
      label: 'Delivered Orders',
      value: stats.deliveredOrders,
      icon: CheckCircle2,
      bgColor: '#F0FDF4',
      iconColor: '#15803D',
      link: '/admin/orders?status=DELIVERED',
    },
    {
      label: 'Registered Customers',
      value: stats.totalCustomers,
      icon: Users,
      bgColor: '#F5F3FF',
      iconColor: '#6D28D9',
      link: '/admin/customers',
    },
    {
      label: 'Gross Sales Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: IndianRupee,
      bgColor: '#FAF5EB',
      iconColor: '#9E792E',
      link: '/admin/orders',
    },
  ];

  return (
    <div>
      {/* Top Banner & Quick Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Atelier Overview
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Real-time status of product inventory, pending shipments, and orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/products/add" className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Saree</span>
          </Link>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm">
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="admin-metrics-grid">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="admin-metric-card" style={{ textDecoration: 'none' }}>
              <div className="admin-metric-icon" style={{ backgroundColor: card.bgColor, color: card.iconColor }}>
                <Icon size={24} />
              </div>
              <div className="admin-metric-info">
                <div className="admin-metric-label" title={card.label}>{card.label}</div>
                <div className="admin-metric-value" title={String(card.value)}>{card.value}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#111827', fontWeight: 600 }}>
            Recent Customer Orders
          </h3>
          <Link to="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--color-gold-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
            No recent orders placed yet.
          </div>
        ) : (
          <div className="admin-table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                      {order.orderNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.userId?.name || order.shippingAddress?.fullName || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{order.userId?.email}</div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items?.length || 0}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`badge ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus} ({order.paymentMethod})
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getOrderStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <Link to="/admin/orders" className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
