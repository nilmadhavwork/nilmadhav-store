import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  if (!item || !item.productId) return null;

  const product = item.productId;
  const quantity = item.quantity || 1;
  const effectiveProductPrice = (product.discountPrice && Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price))
    ? Number(product.discountPrice)
    : Number(product.price || 0);
  const linePrice = item.price || effectiveProductPrice || 0;
  const lineTotal = linePrice * quantity;

  const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
  const isOutOfStock = product.stock <= 0;
  const maxStock = product.stock || 99;

  return (
    <div className="cart-item-row">
      {/* Product Image */}
      <Link to={`/products/${product.slug || product._id}`}>
        <img src={image} alt={product.name} className="cart-item-img" />
      </Link>

      {/* Info & SKU */}
      <div>
        <Link to={`/products/${product.slug || product._id}`}>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            {product.name}
          </h4>
        </Link>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          Unit Price: <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{formatCurrency(linePrice)}</span>
        </div>
        {isOutOfStock ? (
          <span className="badge badge-danger">Out of Stock</span>
        ) : product.stock < 5 ? (
          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
            Only {product.stock} left in stock
          </span>
        ) : (
          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
            In Stock
          </span>
        )}
      </div>

      {/* Quantity Stepper */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div className="qty-stepper">
          <button
            type="button"
            className="qty-btn"
            onClick={() => onUpdateQuantity(product._id, quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="qty-value">{quantity}</span>
          <button
            type="button"
            className="qty-btn"
            onClick={() => onUpdateQuantity(product._id, quantity + 1)}
            disabled={quantity >= maxStock}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(product._id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.78rem',
            color: 'var(--color-danger)',
          }}
        >
          <Trash2 size={13} />
          <span>Remove</span>
        </button>
      </div>

      {/* Line Total */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
          {formatCurrency(lineTotal)}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
