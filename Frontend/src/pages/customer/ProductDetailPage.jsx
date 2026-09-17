import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Plus,
  Minus,
  Check,
  ChevronRight,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import ProductGallery from '../../components/product/ProductGallery';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';

import { useSettings } from '../../context/SettingsContext';

export const ProductDetailPage = () => {
  const { id: slugOrId } = useParams();
  const navigate = useNavigate();

  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { shippingSettings, returnSettings } = useSettings();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        // Attempt fetch by slug first
        const data = await productApi.getBySlug(slugOrId);
        setProduct(data);
      } catch (err) {
        console.warn('Product slug lookup failed, checking all products:', err.message);
        // Fallback search in catalog if ID was passed instead of slug
        try {
          const listRes = await productApi.getAll();
          const match = listRes?.products?.find((p) => p._id === slugOrId || p.slug === slugOrId);
          if (match) {
            setProduct(match);
          } else {
            setError('The requested saree could not be found.');
          }
        } catch (e) {
          setError('Failed to load saree details.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slugOrId) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [slugOrId]);

  if (loading) {
    return <Spinner center size="lg" />;
  }

  if (error || !product) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
        <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
          Saree Not Found
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          {error || 'This saree may have been discontinued or moved.'}
        </p>
        <Link to="/products" className="btn btn-primary">
          Browse All Sarees
        </Link>
      </div>
    );
  }

  const {
    _id,
    name,
    description,
    price,
    discountPrice,
    stock = 0,
    sku,
    fabric,
    color,
    pattern,
    occasion,
    blouseIncluded,
    blouseColor,
    careInstructions,
    images = [],
    categoryId,
  } = product;

  const isWishlisted = isInWishlist(_id);
  const isOutOfStock = stock <= 0;
  const hasDiscount = discountPrice && Number(discountPrice) > 0 && Number(discountPrice) < Number(price);
  const displayPrice = hasDiscount ? Number(discountPrice) : Number(price);
  const discountPercent = hasDiscount ? calculateDiscount(price, discountPrice) : 0;
  const categoryName = typeof categoryId === 'object' ? categoryId?.name : 'Handloom';

  const handleAddToBag = async () => {
    if (!isOutOfStock) {
      await addToCart(_id, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (!isOutOfStock) {
      const added = await addToCart(_id, quantity);
      if (added) {
        navigate('/checkout');
      }
    }
  };

  return (
    <div className="section">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            marginBottom: '2rem',
          }}
        >
          <Link to="/" style={{ color: 'var(--color-text-secondary)' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" style={{ color: 'var(--color-text-secondary)' }}>Sarees</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>{name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="product-detail-layout">
          {/* Left Column: Image Gallery */}
          <div>
            <ProductGallery images={images} productName={name} />
          </div>

          {/* Right Column: Details & Purchasing */}
          <div>
            {/* Category & Title */}
            <div style={{ fontSize: '0.8rem', color: 'var(--color-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.4rem' }}>
              {categoryName} &bull; SKU: {sku}
            </div>

            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary-dark)', marginBottom: '1rem', lineHeight: 1.25 }}>
              {name}
            </h1>

            {/* Pricing */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount ? (
                <span style={{ fontSize: '1.25rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                  {formatCurrency(price)}
                </span>
              ) : null}
              {discountPercent > 0 ? (
                <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  {discountPercent}% OFF
                </span>
              ) : null}
            </div>

            {/* Stock Availability */}
            <div style={{ marginBottom: '1.5rem' }}>
              {isOutOfStock ? (
                <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  Currently Out of Stock
                </span>
              ) : stock < 5 ? (
                <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  Only {stock} sarees remaining in loom inventory!
                </span>
              ) : (
                <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  <Check size={14} />
                  <span>In Stock & Ready for Dispatch</span>
                </span>
              )}
            </div>

            {/* Description */}
            <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1rem' }}>
              {description}
            </div>

            {/* Quantity Stepper & Actions */}
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>Quantity:</div>
                <div className="qty-stepper">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToBag}
                disabled={isOutOfStock || cartLoading}
                style={{ flex: '1 1 200px' }}
              >
                <ShoppingBag size={18} />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </Button>

              {!isOutOfStock && (
                <Button
                  variant="gold"
                  size="lg"
                  onClick={handleBuyNow}
                  style={{ flex: '1 1 200px' }}
                >
                  <span>Buy Now</span>
                </Button>
              )}

              <button
                type="button"
                className={`btn btn-outline ${isWishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                style={{
                  padding: '0 1.25rem',
                  borderColor: isWishlisted ? 'var(--color-danger)' : 'var(--color-border)',
                  color: isWishlisted ? 'var(--color-danger)' : 'var(--color-text)',
                }}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Saree Specifications Table */}
            <div style={{ borderTop: '1.5px solid var(--color-border)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
                Artisanal Specifications
              </h3>
              <table className="spec-table">
                <tbody>
                  {fabric && (
                    <tr>
                      <th>Fabric</th>
                      <td>{fabric}</td>
                    </tr>
                  )}
                  {color && (
                    <tr>
                      <th>Color</th>
                      <td>{color}</td>
                    </tr>
                  )}
                  {pattern && (
                    <tr>
                      <th>Weave Pattern</th>
                      <td>{pattern}</td>
                    </tr>
                  )}
                  {occasion && (
                    <tr>
                      <th>Recommended Occasion</th>
                      <td>{occasion}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Blouse Included</th>
                    <td>
                      {blouseIncluded ? (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          Yes {blouseColor ? `(${blouseColor})` : '(Running piece included)'}
                        </span>
                      ) : (
                        'No (Only Saree)'
                      )}
                    </td>
                  </tr>
                  {careInstructions && (
                    <tr>
                      <th>Care Instructions</th>
                      <td>{careInstructions}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Delivery & Security Assurance Callouts */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Truck size={18} color="var(--color-gold-dark)" />
                <span>
                  {shippingSettings?.freeShippingEnabled && shippingSettings?.freeShippingAbove > 0
                    ? `Complimentary Shipping across India on orders above ${formatCurrency(shippingSettings.freeShippingAbove)}`
                    : shippingSettings?.defaultShippingCharge > 0
                    ? `Standard Flat-Rate Shipping across India (${formatCurrency(shippingSettings.defaultShippingCharge)})`
                    : 'Complimentary Free Shipping across India on all orders'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RotateCcw size={18} color="var(--color-gold-dark)" />
                <span>
                  {returnSettings?.returnEnabled !== false
                    ? `${returnSettings?.returnWindowDays || 7}-Day Doorstep Return & Exchange Policy`
                    : 'Return Policy Applies (Subject to Store Terms)'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={18} color="var(--color-gold-dark)" />
                <span>Silk Mark Authenticity Certified & Inspected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
