import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useCMS } from '../Context/CMSContext';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StorefrontIcon from '@mui/icons-material/Storefront';

const BottomNavigation = () => {
  const location = useLocation();
  const { cartItems } = useCart();
  const { getWishlistCount } = useWishlist();
  const { getTheme } = useCMS();
  
  const wishlistCount = getWishlistCount();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const theme = getTheme();

  const navItems = [
    {
      id: 'home',
      path: '/',
      icon: HomeIcon,
      label: 'Home'
    },
    {
      id: 'shop',
      path: '/products',
      icon: StorefrontIcon,
      label: 'Shop'
    },
    {
      id: 'cart',
      path: '/cart',
      icon: ShoppingCartIcon,
      label: 'Cart',
      badge: cartCount
    },
    {
      id: 'wishlist',
      path: '/wishlist',
      icon: FavoriteIcon,
      label: 'Wishlist',
      badge: wishlistCount
    },
    {
      id: 'account',
      path: '/account',
      icon: AccountCircleIcon,
      label: 'Account'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden mobile-safe-bottom pb-1"
      style={{ 
        backgroundColor: '#ffffff',
        borderTopColor: theme.muted || '#e5e7eb'
      }}
    >
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 relative rounded-lg transition-all duration-200 ${
                active ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: active ? (theme.accent || '#FF5722') : 'transparent'
              }}
            >
              <div className="relative">
                <Icon
                  className="text-xl"
                  style={{ 
                    color: active ? '#ffffff' : '#000000'
                  }}
                />
                {item.badge > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 text-xs font-bold text-white rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ 
                      backgroundColor: active ? '#ffffff' : (theme.accent || '#FF5722'),
                      color: active ? (theme.accent || '#FF5722') : '#ffffff',
                      fontSize: '10px',
                      minWidth: '18px',
                      height: '18px'
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span 
                className="text-xs mt-1 truncate font-medium"
                style={{ 
                  color: active ? '#ffffff' : '#000000'
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
