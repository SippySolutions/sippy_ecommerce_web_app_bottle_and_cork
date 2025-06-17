import React, { useState } from 'react';
import { useWishlist } from '../Context/WishlistContext';
import { useCMS } from '../Context/CMSContext';
import { toast } from 'react-toastify';

const WishlistIcon = ({ product, size = 'md', className = '' }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { getTheme } = useCMS();
  const [isLoading, setIsLoading] = useState(false);
  const theme = getTheme();
  
  // Safety check for product
  if (!product || !product._id) {
    return null;
  }
  
  const inWishlist = isInWishlist(product._id);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      let result;
      if (inWishlist) {
        result = await removeFromWishlist(product._id);
      } else {
        result = await addToWishlist(product);
      }
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={`
        group relative p-2 rounded-full transition-all duration-200 
        hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        backgroundColor: inWishlist ? `${theme.accent}15` : 'rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* Heart Icon */}
      <svg
        className={`${sizeClasses[size]} transition-all duration-200`}
        fill={inWishlist ? theme.accent : 'none'}
        stroke={inWishlist ? theme.accent : '#6B7280'}
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
        {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="animate-spin rounded-full border-2 border-transparent border-t-current"
            style={{ 
              width: size === 'sm' ? '12px' : size === 'lg' ? '20px' : '16px',
              height: size === 'sm' ? '12px' : size === 'lg' ? '20px' : '16px',
              color: theme.accent 
            }}
          />
        </div>
      )}
    </button>
  );
};

export default WishlistIcon;
