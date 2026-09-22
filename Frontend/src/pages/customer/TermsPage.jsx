import React from 'react';
import { FileText, Scale, ShoppingBag, RotateCcw, AlertTriangle, Mail, Phone, MapPin } from 'lucide-react';

export const TermsPage = () => {
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
            <Scale size={32} />
          </div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
            Terms & Conditions
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
            Welcome to <strong>Nilmadhav Sarees</strong> ("Store", "we", "us", or "our"). These Terms and Conditions ("Terms") govern your use of our website, customer services, and product purchases. By accessing or shopping with us, you agree to be bound by these Terms and our Privacy Policy.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)', margin: '2rem 0' }} />

          {/* Section 1 */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--color-gold)" /> 1. Eligibility & Account Responsibilities
            </h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.95rem' }}>
              <li>You must be at least 18 years of age or visiting under the supervision of a parent/guardian to make purchases.</li>
              <li>You are responsible for protecting your account credentials and password confidentiality.</li>
              <li>You agree to provide accurate and complete information during registration and shipping address creation.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} color="var(--color-gold)" /> 2. Product Specifications & Pricing
            </h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.95rem' }}>
              <li><strong>Authenticity & Accuracy:</strong> We present genuine descriptions, fabric compositions, and high-definition photographs. Actual colors may vary slightly due to device display configurations and photography lighting.</li>
              <li><strong>Pricing & Stock:</strong> Prices are displayed in Indian Rupees (INR). Prices and stock availability are subject to change. In case of pricing errors, we reserve the right to cancel affected orders with immediate notification and refund.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={20} color="var(--color-gold)" /> 3. Orders, Returns & Refunds
            </h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.95rem' }}>
              <li><strong>Payments:</strong> We accept online payment via Razorpay (Cards, UPI, Netbanking) and Cash on Delivery (COD) for eligible pincodes.</li>
              <li><strong>Doorstep Returns:</strong> Eligible items can be returned within 7 days of delivery through your customer account. Items must be unwashed, unused, with tags intact.</li>
              <li><strong>Refund Timeline:</strong> Approved refunds are credited to the original payment source (or bank transfer for COD) within 7 working days following quality inspection.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="var(--color-gold)" /> 4. Intellectual Property & Governing Law
            </h2>
            <p style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              All brand assets, handloom imagery, logos, graphics, and text on this platform are copyrighted property of Nilmadhav Sarees. Unauthorized commercial reuse is strictly prohibited.
            </p>
            <p style={{ fontSize: '0.95rem' }}>
              These terms are governed by the laws of India. Any legal proceedings shall be subject to the exclusive jurisdiction of the courts in Surat, Gujarat, India.
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
              Legal Inquiries & Customer Contact
            </h3>
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
                <span>Surat, Gujarat 395002, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
