import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProductCard = ({ product }) => {
  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const {
    _id,
    name,
    slug,
    price,
    discountPrice,
    images = [],
    stock = 0,
    categoryId,
  } = product;

  const primaryImage = images.find((img) => img.isPrimary)?.url || images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = images[1]?.url || primaryImage;
  const discountPercent = calculateDiscount(price, discountPrice);
  const isOutOfStock = stock <= 0;
  const isWishlisted = isInWishlist(_id);

  const displayPrice = discountPrice || price;
  const originalPrice = discountPrice ? price : null;

  const categoryName = typeof categoryId === 'object' ? categoryId?.name : 'Saree';
  const productUrl = `/products/${slug || _id}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(_id, 1);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="product-card">
      <Link to={productUrl} className="product-image-container">
        <img
          src={primaryImage}
          alt={name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Badges */}
        <div className="product-badge-group">
          {discountPercent > 0 && (
            <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </Link>

      <div className="product-info">
        <div className="product-category-tag">{categoryName}</div>
        <Link to={productUrl}>
          <h3 className="product-title" title={name}>
            {name}
          </h3>
        </Link>

        <div className="product-pricing">
          <span className="price-current">{formatCurrency(displayPrice)}</span>
          {originalPrice && (
            <span className="price-original">{formatCurrency(originalPrice)}</span>
          )}
        </div>

        <div className="product-card-actions">
          <button
            className="btn btn-primary btn-sm btn-block"
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
          >
            <ShoppingBag size={15} />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
