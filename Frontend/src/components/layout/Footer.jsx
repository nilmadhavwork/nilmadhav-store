import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#21070F', color: '#E8DED6', borderTop: '2px solid var(--color-gold)', marginTop: 'auto' }}>
      {/* Heritage Assurance Badges */}
      <div style={{ borderBottom: '1px solid rgba(197, 160, 89, 0.2)', padding: '2.5rem 0', background: 'rgba(0,0,0,0.15)' }}>
        <div className="container">
          <div className="footer-features-grid">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Sparkles size={24} />
              </div>
              <h4 style={{ color: '#FAF5EB', fontSize: '1.05rem', marginBottom: '0.25rem' }}>100% Authentic Weaves</h4>
              <p style={{ fontSize: '0.85rem', color: '#BFB5AC' }}>Directly sourced from master weavers across India</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Truck size={24} />
              </div>
              <h4 style={{ color: '#FAF5EB', fontSize: '1.05rem', marginBottom: '0.25rem' }}>Complimentary Shipping</h4>
              <p style={{ fontSize: '0.85rem', color: '#BFB5AC' }}>Fast Pan-India delivery via Shiprocket network</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <RefreshCw size={24} />
              </div>
              <h4 style={{ color: '#FAF5EB', fontSize: '1.05rem', marginBottom: '0.25rem' }}>7-Day Easy Returns</h4>
              <p style={{ fontSize: '0.85rem', color: '#BFB5AC' }}>Hassle-free doorstep returns and full refunds</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h4 style={{ color: '#FAF5EB', fontSize: '1.05rem', marginBottom: '0.25rem' }}>Secure Payment & COD</h4>
              <p style={{ fontSize: '0.85rem', color: '#BFB5AC' }}>Razorpay 256-bit encryption & Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '4rem 1.5rem 2.5rem 1.5rem' }}>
        <div className="footer-links-grid">
          {/* Brand Column */}
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-gold-light)', marginBottom: '0.25rem' }}>
              Nilmadhav
            </div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>
              Heritage Silks & Sarees
            </div>
            <p style={{ fontSize: '0.9rem', color: '#D4C9BF', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Custodians of timeless Indian textile heritage. Handcrafted Banarasi silks, Kanjivaram heirlooms, and artisanal weaves tailored for memorable celebrations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#C5BAAF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--color-gold)" />
                <span>Textile Market Ring Road, Surat, Gujarat 395002</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--color-gold)" />
                <span>+91 98765 43210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--color-gold)" />
                <span>care@nilmadhavsarees.com</span>
              </div>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 style={{ color: '#FAF5EB', fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(197, 160, 89, 0.3)', paddingBottom: '0.5rem', width: 'fit-content' }}>
              Heritage Collections
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li><Link to="/products?fabric=Banarasi" style={{ color: '#D4C9BF' }}>Pure Banarasi Silk</Link></li>
              <li><Link to="/products?fabric=Kanjivaram" style={{ color: '#D4C9BF' }}>Kanjivaram Silk Sarees</Link></li>
              <li><Link to="/products?fabric=Chanderi" style={{ color: '#D4C9BF' }}>Chanderi Handloom</Link></li>
              <li><Link to="/products?occasion=Bridal" style={{ color: '#D4C9BF' }}>Bridal & Wedding Edit</Link></li>
              <li><Link to="/products?fabric=Organza" style={{ color: '#D4C9BF' }}>Floral Organza & Tissue</Link></li>
              <li><Link to="/products" style={{ color: '#D4C9BF' }}>View All Sarees</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 style={{ color: '#FAF5EB', fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(197, 160, 89, 0.3)', paddingBottom: '0.5rem', width: 'fit-content' }}>
              Customer Experience
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li><Link to="/orders" style={{ color: '#D4C9BF' }}>Track Your Order</Link></li>
              <li><Link to="/returns" style={{ color: '#D4C9BF' }}>Return & Refund Requests</Link></li>
              <li><Link to="/cart" style={{ color: '#D4C9BF' }}>Shopping Bag</Link></li>
              <li><Link to="/wishlist" style={{ color: '#D4C9BF' }}>Saved Wishlist</Link></li>
              <li><Link to="/profile" style={{ color: '#D4C9BF' }}>My Account & Addresses</Link></li>
            </ul>
          </div>

          {/* Trust & Policies */}
          <div>
            <h4 style={{ color: '#FAF5EB', fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(197, 160, 89, 0.3)', paddingBottom: '0.5rem', width: 'fit-content' }}>
              Store Policies
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li style={{ color: '#D4C9BF' }}>Pan-India Delivery in 3-5 Days</li>
              <li style={{ color: '#D4C9BF' }}>Silk Mark Authentic Guarantee</li>
              <li style={{ color: '#D4C9BF' }}>Zero Tamper Packaging</li>
              <li style={{ color: '#D4C9BF' }}>Dry Clean Care Recommendations</li>
              <li>
                <Link to="/admin/login" style={{ color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Admin Staff Portal &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div style={{ marginTop: '3.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.825rem', color: '#9E9389' }}>
          <div>
            &copy; {new Date().getFullYear()} Nilmadhav Sarees. Handcrafted with reverence in India. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Shipping Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
