import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../components/AuthContext';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../services/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);

  // Load wishlist when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, user]);

  const loadWishlist = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await getWishlist();
      if (response.success) {
        setWishlistItems(response.wishlist);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };
  const addItemToWishlist = async (product) => {
    if (!isAuthenticated) {
      // Could show login prompt here
      return { success: false, message: 'Please login to add items to wishlist' };
    }

    if (!product || !product._id) {
      return { success: false, message: 'Invalid product' };
    }

    try {
      const response = await addToWishlist(product._id);
      if (response.success) {
        setWishlistItems(prev => [...prev, response.product]);
        return { success: true, message: 'Added to wishlist' };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add to wishlist' 
      };
    }
  };
  const removeItemFromWishlist = async (productId) => {
    if (!isAuthenticated) return { success: false, message: 'Not authenticated' };
    
    if (!productId) {
      return { success: false, message: 'Invalid product ID' };
    }

    try {
      const response = await removeFromWishlist(productId);
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item && item._id !== productId));
        return { success: true, message: 'Removed from wishlist' };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to remove from wishlist' 
      };
    }
  };

  const clearAllWishlist = async () => {
    if (!isAuthenticated) return { success: false, message: 'Not authenticated' };

    try {
      const response = await clearWishlist();
      if (response.success) {
        setWishlistItems([]);
        return { success: true, message: 'Wishlist cleared' };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to clear wishlist' 
      };
    }
  };
  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistItems.some(item => item && item._id === productId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist: addItemToWishlist,
    removeFromWishlist: removeItemFromWishlist,
    clearWishlist: clearAllWishlist,
    isInWishlist,
    getWishlistCount,
    loadWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
