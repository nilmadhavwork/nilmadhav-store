import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';

export const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const {
    items,
    cartSubtotal,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="section container">
        <EmptyState
          icon={ShoppingBag}
          title="Please Sign In"
          description="Sign in to your Nilmadhav account to view your saved shopping bag and checkout."
          actionLabel="Sign In to Bag"
          onAction={() => navigate('/login?redirect=/cart')}
        />
      </div>
    );
  }

  if (loading && items.length === 0) {
    return <Spinner center size="lg" />;
  }

  if (items.length === 0) {
    return (
      <div className="section container">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Bag is Empty"
          description="You have not added any handcrafted sarees to your shopping bag yet. Explore our timeless collections to begin."
          actionLabel="Explore Collections"
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
            marginBottom: '2rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
              Shopping Bag
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {items.length} {items.length === 1 ? 'saree item' : 'saree items'} in your bag
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/products" className="btn btn-secondary btn-sm">
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </Link>

            <button
              onClick={clearCart}
              className="btn btn-sm btn-outline"
              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            >
              <Trash2 size={15} />
              <span>Clear Bag</span>
            </button>
          </div>
        </div>

        {/* Cart Grid Layout */}
        <div className="cart-layout">
          {/* Items List */}
          <div className="cart-items-card">
            {items.map((item) => (
              <CartItem
                key={item.productId?._id || item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <CartSummary
              subtotal={cartSubtotal}
              onCheckout={() => navigate('/checkout')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
