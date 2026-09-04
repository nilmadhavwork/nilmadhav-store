import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data || { items: [] });
    } catch (err) {
      console.warn('Could not fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      error('Please sign in to add items to your cart.', 'Sign In Required');
      return false;
    }
    try {
      setLoading(true);
      const updatedCart = await cartApi.addItem(productId, quantity);
      setCart(updatedCart);
      success('Saree added to your shopping bag.', 'Added to Bag');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add item to bag';
      error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return false;
    try {
      if (quantity <= 0) {
        return removeFromCart(productId);
      }
      const updatedCart = await cartApi.updateQuantity(productId, quantity);
      setCart(updatedCart);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update quantity';
      error(msg);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return false;
    try {
      const updatedCart = await cartApi.removeItem(productId);
      setCart(updatedCart);
      success('Item removed from shopping bag');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not remove item';
      error(msg);
      return false;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      await cartApi.clearCart();
      setCart({ items: [] });
    } catch (err) {
      console.warn('Failed to clear cart', err.message);
    }
  };

  const items = cart?.items || [];
  const cartCount = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const cartSubtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        cartSubtotal,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
