import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { fetchCart } = useCart();
  const { success, error, info } = useToast();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist({ products: [] });
      return;
    }
    try {
      setLoading(true);
      const data = await wishlistApi.getWishlist();
      setWishlist(data || { products: [] });
    } catch (err) {
      console.warn('Could not fetch wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const products = wishlist?.products || [];

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId || !products.length) return false;
      return products.some((p) => {
        const id = p.productId?._id || p.productId;
        return id?.toString() === productId?.toString();
      });
    },
    [products]
  );

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      error('Please sign in to manage your wishlist.', 'Sign In Required');
      return false;
    }

    const productId = product._id || product;
    const isSaved = isInWishlist(productId);

    try {
      if (isSaved) {
        const updated = await wishlistApi.removeItem(productId);
        setWishlist(updated);
        info('Removed from your wishlist.');
      } else {
        const updated = await wishlistApi.addItem(productId);
        setWishlist(updated);
        success('Added to your wishlist.');
      }
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update wishlist';
      error(msg);
      return false;
    }
  };

  const moveToCart = async (productId) => {
    if (!isAuthenticated) return false;
    try {
      const res = await wishlistApi.moveToCart(productId);
      setWishlist(res.wishlist || { products: [] });
      await fetchCart();
      success('Saree moved from wishlist to bag.');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not move item to bag';
      error(msg);
      return false;
    }
  };

  const wishlistCount = products.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        products,
        wishlistCount,
        loading,
        isInWishlist,
        toggleWishlist,
        moveToCart,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
