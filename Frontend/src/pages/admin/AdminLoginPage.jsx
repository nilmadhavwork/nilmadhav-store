import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const AdminLoginPage = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);

      if (res.role !== 'ADMIN') {
        setError('Access denied. Administrator privileges required.');
        return;
      }

      success(`Welcome to Management Console, ${res.name}`);
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials or unauthorized access';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 30%, #3B0D1A 0%, #20060E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          padding: '2.5rem 2rem',
          border: '1px solid rgba(197, 160, 89, 0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: '0.35rem' }}>
            Atelier Admin Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Sign in with administrative credentials
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--color-danger-border)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Admin Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@nilmadhavsarees.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
          />

          <div style={{ marginTop: '1.75rem' }}>
            <Button variant="primary" block size="lg" type="submit" loading={loading}>
              <Lock size={16} />
              <span>Enter Admin Console</span>
            </Button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.25rem', fontSize: '0.85rem' }}>
          <a href="/" style={{ color: 'var(--color-gold-dark)', fontWeight: 600 }}>
            &larr; Return to Customer Storefront
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
