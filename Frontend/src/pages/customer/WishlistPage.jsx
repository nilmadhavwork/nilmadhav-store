import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';

export const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const { products, loading, moveToCart, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="section container">
        <EmptyState
          icon={Heart}
          title="Please Sign In"
          description="Sign in to save and access your cherished wishlist across all devices."
          actionLabel="Sign In"
          onAction={() => navigate('/login?redirect=/wishlist')}
        />
      </div>
    );
  }

  if (loading && products.length === 0) {
    return <Spinner center size="lg" />;
  }

  if (products.length === 0) {
    return (
      <div className="section container">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Explore our handloom masterpieces and click the heart icon on any saree to save your favorites."
          actionLabel="Browse Sarees"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
              Saved Wishlist
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {products.length} {products.length === 1 ? 'saree saved' : 'sarees saved'} for later
            </p>
          </div>

          <Link to="/products" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Wishlist Grid */}
        <div className="product-grid">
          {products.map((item) => {
            const product = item.productId;
            if (!product) return null;

            const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
            const price = product.discountPrice || product.price;

            return (
              <div key={product._id} className="product-card">
                <Link to={`/products/${product.slug || product._id}`} className="product-image-container">
                  <img src={image} alt={product.name} className="product-image" />
                </Link>

                <div className="product-info">
                  <Link to={`/products/${product.slug || product._id}`}>
                    <h3 className="product-title" title={product.name}>
                      {product.name}
                    </h3>
                  </Link>

                  <div className="product-pricing">
                    <span className="price-current">{formatCurrency(price)}</span>
                    {product.discountPrice && (
                      <span className="price-original">{formatCurrency(product.price)}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      block
                      onClick={() => moveToCart(product._id)}
                    >
                      <ShoppingBag size={15} />
                      <span>Move to Bag</span>
                    </Button>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleWishlist(product)}
                      title="Remove from wishlist"
                      style={{ padding: '0.45rem 0.75rem' }}
                    >
                      <Trash2 size={15} color="var(--color-danger)" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
