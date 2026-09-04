import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email address';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await login(formData.email, formData.password);
      success(`Welcome back, ${res.name}!`);

      if (res.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')
          ? 'Unable to connect to server. Please verify backend is running on port 5020.'
          : 'Invalid email or password');
      toastError(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div
        className="container"
        style={{
          maxWidth: '440px',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold-dark)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Sparkles size={14} />
            <span>Welcome Back</span>
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)' }}>
            Sign In to Nilmadhav
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Access your saved bags, order tracking, and wishlists.
          </p>
        </div>

        {errors.form && (
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
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <div style={{ marginTop: '1.75rem' }}>
            <Button variant="primary" block size="lg" type="submit" loading={loading}>
              <LogIn size={18} />
              <span>Sign In</span>
            </Button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
