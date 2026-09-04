import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  const ALLOWED_EMAIL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'yahoo.co.in',
    'yahoo.co.uk',
    'ymail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'icloud.com',
    'rediffmail.com',
    'zoho.com',
    'proton.me',
    'protonmail.com',
    'aol.com',
  ];

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }

    const trimmedEmail = formData.email.trim().toLowerCase();
    if (!trimmedEmail) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      errs.email = 'Invalid email address format';
    } else {
      const domain = trimmedEmail.split('@')[1];
      if (!domain || !ALLOWED_EMAIL_DOMAINS.includes(domain)) {
        errs.email = 'Please use a valid provider (e.g. @gmail.com, @yahoo.com, @outlook.com, @icloud.com)';
      }
    }

    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      success(`Welcome to Nilmadhav, ${res.name}!`);
      navigate(redirectUrl);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')
          ? 'Unable to connect to server. Please verify backend is running on port 5020.'
          : 'Registration failed. Please try again.');
      toastError(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div
        className="container"
        style={{
          maxWidth: '480px',
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
            <span>Join Our Atelier</span>
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Experience personalized recommendations and seamless checkout.
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
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="e.g. Ananya Sharma"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="you@example.com"
            />

            <Input
              label="Phone Number"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              placeholder="10-digit mobile"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              placeholder="Min. 6 chars"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              placeholder="Re-enter password"
            />
          </div>

          <div style={{ marginTop: '1.75rem' }}>
            <Button variant="primary" block size="lg" type="submit" loading={loading}>
              <UserPlus size={18} />
              <span>Create Account</span>
            </Button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
