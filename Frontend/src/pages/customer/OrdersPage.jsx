import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import OrderCard from '../../components/order/OrderCard';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';

export const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.warn('Failed to load orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <Spinner center size="lg" />;
  }

  if (orders.length === 0) {
    return (
      <div className="section container">
        <EmptyState
          icon={Package}
          title="No Orders Placed Yet"
          description="You haven't placed any saree orders yet. Discover our royal weaves and start your collection today."
          actionLabel="Explore Sarees"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '860px' }}>
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            My Orders
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Track live Shiprocket shipping, view invoices, cancel eligible orders, and manage returns.
          </p>
        </div>

        <div>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
