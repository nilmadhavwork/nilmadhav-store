import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(197, 160, 89, 0.15)',
              color: 'var(--color-gold)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Nilmadhav Sarees &bull; Effective Date: September 22, 2026
          </p>
        </div>

        {/* Content Box */}
        <div
          style={{
            backgroundColor: 'var(--color-card, #FFFFFF)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
            lineHeight: '1.7',
            color: 'var(--color-text)',
          }}
        >
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            Welcome to <strong>Nilmadhav Sarees</strong> ("we," "our," or "us"). We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, register an account, purchase products, or interact with our services.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)', margin: '2rem 0' }} />

          {/* Section 1 */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={20} color="var(--color-gold)" /> 1. Information We Collect
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              We collect information that identifies, relates to, or can be associated with you ("Personal Data").
            </p>
            <div style={{ paddingLeft: '1rem', borderLeft: '3px solid var(--color-gold)', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>A. Information You Provide Directly:</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.95rem' }}>
                <li><strong>Account Details:</strong> Full Name, Email Address, Phone Number, and Password (encrypted/hashed using bcrypt).</li>
                <li><strong>Shipping & Billing Address:</strong> Full Name, Phone Number, Street Address, City, State, Pincode, and Country.</li>
                <li><strong>Payment Information:</strong> Selected Payment Method (Cash on Delivery or Online via Razorpay). Payment IDs and transaction statuses are stored. We do <em>NOT</em> store credit/debit card numbers or bank credentials on our servers.</li>
                <li><strong>Customer Support & Returns:</strong> Information provided during inquiries, return requests, and uploaded proof images.</li>
              </ul>
            </div>
            <div style={{ paddingLeft: '1rem', borderLeft: '3px solid var(--color-primary-light, #7C1D38)', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>B. Information Collected Automatically:</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.95rem' }}>
                <li><strong>Technical Data:</strong> IP address, browser type, operating system, and device details.</li>
                <li><strong>Usage & Session Data:</strong> Browsed products, cart items, wishlist state, and interaction logs.</li>
                <li><strong>Cookies & Local Tokens:</strong> JSON Web Tokens (JWT) and browser storage to preserve your login state and shopping cart.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} color="var(--color-gold)" /> 2. How We Use Your Information
            </h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.95rem' }}>
              <li><strong>Order Processing & Fulfillment:</strong> Managing purchases, processing payments, dispatching packages, and providing tracking updates.</li>
              <li><strong>Account Security:</strong> Authenticating users and safeguarding accounts against unauthorized access.</li>
              <li><strong>Customer Support & Returns:</strong> Handling cancellation requests, evaluating doorstep returns, and processing refunds.</li>
              <li><strong>Service Improvement:</strong> Caching cart and wishlist preferences to deliver a seamless shopping experience.</li>
              <li><strong>Legal Compliance:</strong> Adhering to applicable tax, accounting, and legal requirements in India.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--color-gold)" /> 3. Third-Party Services & Data Sharing
            </h2>
            <p style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              We do not sell or rent your personal data. We share necessary data only with essential operational service providers:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.95rem' }}>
              <li><strong>Razorpay:</strong> Secure payment gateway compliant with PCI-DSS standards.</li>
              <li><strong>Shiprocket & Courier Network:</strong> Shares delivery address and contact details for shipping fulfillment and doorstep return pickups.</li>
              <li><strong>Cloudinary:</strong> Secure cloud storage for catalog media and customer return proof uploads.</li>
              <li><strong>Legal Obligations:</strong> Disclosure if mandated by applicable law, court order, or governmental regulation.</li>
            </ul>
          </section>

          {/* Section 4 & 5 */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
              4. Security, Cookies & Data Rights
            </h2>
            <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              <strong>Security:</strong> All account passwords are encrypted using industry-standard salted bcrypt algorithms. Data transmitted between your browser and our server is secured using HTTPS protocol.
            </p>
            <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              <strong>Cookies:</strong> We use essential session cookies and JWT authentication tokens to maintain your shopping cart and logged-in account status.
            </p>
            <p style={{ fontSize: '0.95rem' }}>
              <strong>Your Rights:</strong> You have full rights to access, update, or remove your saved shipping addresses and personal profile via your account dashboard, or request complete account erasure by contacting our support team.
            </p>
          </section>

          {/* Contact Section */}
          <div
            style={{
              backgroundColor: '#FAF5EB',
              border: '1px solid var(--color-gold)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '1.5rem',
              marginTop: '2.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
              Questions & Contact Information
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              If you have any questions or concerns regarding our Privacy Policy, please reach out to our team:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--color-gold-dark)" />
                <span>nilmadhav.work@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--color-gold-dark)" />
                <span>+91 98765 43210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--color-gold-dark)" />
                <span>Textile Market Ring Road, Surat, Gujarat 395002, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
