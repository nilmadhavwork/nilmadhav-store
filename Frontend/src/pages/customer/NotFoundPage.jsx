import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '540px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-gold-bg)', color: 'var(--color-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <Compass size={40} />
        </div>
        <h1 style={{ fontSize: '3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '1rem' }}>
          Sacred Drape Not Found
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          The page or saree collection you are seeking may have moved, expired, or exists under another royal weave.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          Return to Atelier Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
