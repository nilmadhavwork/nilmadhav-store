import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Truck, Award, Eye } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import ProductGrid from '../../components/product/ProductGrid';
import Button from '../../components/common/Button';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productApi.getAll({ limit: 8 }),
          categoryApi.getAll(),
        ]);
        setFeaturedProducts(prodRes?.products || []);
        setCategories(catRes || []);
      } catch (err) {
        console.warn('Failed to load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Default rich categories if backend is fresh
  const displayCategories = categories.length > 0 ? categories : [
    {
      _id: 'cat_banarasi',
      name: 'Banarasi Silk',
      slug: 'banarasi-silk',
      description: 'Regal hand-spun mulberry silks from the historic ghats of Varanasi.',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    },
    {
      _id: 'cat_kanjivaram',
      name: 'Kanjivaram Silk',
      slug: 'kanjivaram-silk',
      description: 'Heirloom temple borders and pure gold zari from the weavers of Tamil Nadu.',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    },
    {
      _id: 'cat_chanderi',
      name: 'Chanderi Handloom',
      slug: 'chanderi-handloom',
      description: 'Featherlight sheer elegance woven with fine silk and golden bootis.',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    },
    {
      _id: 'cat_bridal',
      name: 'Royal Bridal Edit',
      slug: 'royal-bridal',
      description: 'Intricately embroidered crimson and gold sarees crafted for your big day.',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay-pattern" />
        <div className="container hero-content">
          <div className="hero-tagline">
            <Sparkles size={16} />
            <span>The Royal Weaves of India</span>
          </div>

          <h1 className="hero-title">
            Where Ancient Looms Meet <em>Modern Royalty</em>
          </h1>

          <p className="hero-subtitle">
            Immerse yourself in centuries of handcrafted legacy. Authentic pure silk Banarasi sarees, lustrous Kanjivaram heirlooms, and artisanal weaves brought directly to your doorstep.
          </p>

          <div className="hero-cta-group">
            <Link to="/products" className="btn btn-gold btn-lg">
              <span>Explore All Collections</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/products?occasion=Bridal" className="btn btn-outline-gold btn-lg" style={{ color: '#FAF5EB', borderColor: 'var(--color-gold-light)' }}>
              <span>Bridal Couture</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-subtitle">Artisanal Heritage</div>
            <h2 className="section-title">Shop by Sacred Weave</h2>
            <p className="section-description">
              Each drape tells the sacred tale of Indian artistry, passed down across generations of master craftsmen.
            </p>
          </div>

          <div className="category-grid">
            {displayCategories.slice(0, 4).map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="category-card"
              >
                <img src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'} alt={cat.name} />
                <div className="category-card-overlay">
                  <h3 className="category-card-title">{cat.name}</h3>
                  <span className="category-card-count">Explore Weaves &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Sarees Section */}
      <section className="section" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-subtitle">Curated Highlights</div>
            <h2 className="section-title">New Arrivals & Masterpieces</h2>
            <p className="section-description">
              Freshly off the handloom—draped in pure zari, timeless motifs, and unparalleled hand-feel.
            </p>
          </div>

          <ProductGrid
            products={featuredProducts}
            loading={loading}
            emptyTitle="No sarees loaded yet"
            emptyDescription="New festive collections are being woven. Check back shortly!"
          />

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link to="/products" className="btn btn-outline btn-lg">
              <span>View Full Atelier Catalog ({featuredProducts.length}+ Sarees)</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Brand Narrative Story Section */}
      <section className="section">
        <div className="container">
          <div className="brand-narrative-grid">
            <div style={{ position: 'relative' }}>
              <div className="brand-narrative-frame" />
              <img
                src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80"
                alt="Weaving artisan"
                style={{
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: 'var(--shadow-lg)',
                }}
              />
            </div>

            <div>
              <div className="section-subtitle">The Nilmadhav Philosophy</div>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                Honoring 400 Years of Loom Artistry
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
                At Nilmadhav Sarees, every single thread carries a breath of history. We collaborate directly with master weavers in Varanasi, Kanchipuram, and Chanderi—eliminating unnecessary middlemen and preserving authentic, hand-guided jacquard and pit loom techniques.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.75rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
                Whether it is the heavyweight resham borders of a bridal Kanjivaram or the ethereal grace of a zari tissue organza, our sarees are created to be cherished and passed down as family heirlooms.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary-dark)', fontFamily: 'var(--font-serif)' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Silk Mark Certified Pure Silk</div>
                </div>
                <div style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary-dark)', fontFamily: 'var(--font-serif)' }}>
                    500+
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Weaver Families Supported</div>
                </div>
              </div>

              <Link to="/products" className="btn btn-primary">
                Explore The Heritage Edit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Promotional Callout Banner */}
      <section style={{ background: 'linear-gradient(90deg, #5B1527 0%, #360914 100%)', color: '#FFFFFF', padding: '3.5rem 0', borderTop: '1px solid var(--color-gold)', borderBottom: '1px solid var(--color-gold)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold-light)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
            <Award size={18} />
            <span>Festive Season Privilege</span>
          </div>
          <h2 style={{ color: '#FAF5EB', fontSize: '2.4rem', marginBottom: '1rem' }}>
            Enjoy Free Express Delivery Pan-India
          </h2>
          <p style={{ color: '#DDD2C6', fontSize: '1.05rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Every saree arrives in our signature ceremonial velvet-lined gift box with authentic silk certification and tamper-proof courier seal.
          </p>
          <Link to="/products" className="btn btn-gold btn-lg">
            Shop The Festive Collection
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
