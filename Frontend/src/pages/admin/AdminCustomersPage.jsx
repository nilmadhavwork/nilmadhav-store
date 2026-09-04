import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Search } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getCustomers();
        setCustomers(data || []);
      } catch (err) {
        console.warn('Failed to load customers:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Registered Customers Directory
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            View client contact details, registration history, and order frequencies.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', maxWidth: '380px', width: '100%', marginBottom: '1.5rem' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            paddingLeft: '2.75rem',
            fontSize: '0.875rem',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            width: '100%',
          }}
        />
      </div>

      {loading ? (
        <Spinner center size="lg" />
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280' }}>No customer profiles found matching your query.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Registered Date</th>
                <th>Total Orders</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust) => (
                <tr key={cust._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                        {cust.name}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4B5563' }}>
                      <Mail size={14} color="#9CA3AF" />
                      <span>{cust.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4B5563' }}>
                      <Phone size={14} color="#9CA3AF" />
                      <span>{cust.phone || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6B7280', fontSize: '0.85rem' }}>
                      <Calendar size={14} color="#9CA3AF" />
                      <span>{formatDate(cust.createdAt)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                      {cust.ordersCount || 1} Orders
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${cust.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                      {cust.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
