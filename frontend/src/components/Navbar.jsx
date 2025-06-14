import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Import AuthContext
import { useCart } from '../Context/CartContext'; // Import CartContext
import { useCMS } from '../Context/CMSContext'; // Import CMS Context
import SearchBar from './SearchBar'; // Import SearchBar component
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ListIcon from '@mui/icons-material/List';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { fetchDepartments } from '../services/api'; // Import your API function

function Navbar() {
  const { user, logout } = useContext(AuthContext); // Use user and logout from AuthContext
  const { cartItems } = useCart(); // Access cartItems from CartContext
  const { 
    cmsData, 
    loading: cmsLoading, 
    getLogo, 
    getStoreInfo, 
    getCurrentStoreStatus 
  } = useCMS(); // Use CMS context
  
  const [wishlistCount, setWishlistCount] = useState(); // Example wishlist count
  const [departments, setDepartments] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to toggle dropdown
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu
  const navigate = useNavigate();

  // Get store status
  const storeStatus = getCurrentStoreStatus();

  useEffect(() => {
    console.log('User:', user); // Debugging log to check user state

    const getDepartments = async () => {
      try {
        const data = await fetchDepartments();
        setDepartments(data.departments || []);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    getDepartments();
  }, [user]);

  return (
    <nav className="bg-white shadow-md">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">        {/* Logo */}
        <Link to="/" className="flex items-center text-4xl font-bold text-[var(--color-accent)]">
          {!cmsLoading && getLogo() ? (
            <img
              src={getLogo()}
              alt="Store Logo"
              className="h-24 w-auto mr-2"
            />
          ) : (
            <div className="h-24 w-24 bg-gray-200 animate-pulse rounded mr-2"></div>
          )}
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-gray-600 hover:text-[var(--color-accent)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
        </button>        {/* Desktop Search Bar */}
        <div className="hidden lg:flex items-center w-full max-w-2xl mx-4">
          <SearchBar className="w-full" placeholder="Search products, brands, categories..." />
        </div>

        {/* Icons */}
        <div className="hidden lg:flex items-center space-x-6 relative">
          {user ? (
            <div
              className="relative cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}    
            >
              <AccountCircleIcon fontSize="large" className="text-[var(--color-background)] hover:text-[var(--color-accent)]" />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  <p className="px-4 py-2 text-gray-700 font-bold">{user.name}</p>                  <hr />
                  <ul className="space-y-2 px-4 py-2">
                    <li>
                      <Link to="/account?tab=profile" className="flex items-center text-gray-700 hover:text-[var(--color-accent)]">
                        <AccountCircleIcon className="mr-2" />
                        My Details
                      </Link>
                    </li>
                    <li>
                      <Link to="/account?tab=orders" className="flex items-center text-gray-700 hover:text-[var(--color-accent)]">
                        <ListIcon className="mr-2" />
                        Order History
                      </Link>
                    </li>
                    <li>
                      <Link to="/account?tab=addresses" className="flex items-center text-gray-700 hover:text-[var(--color-accent)]">
                        <HomeIcon className="mr-2" />
                        Addresses
                      </Link>
                    </li>
                    <li>
                      <Link to="/account?tab=billing" className="flex items-center text-gray-700 hover:text-[var(--color-accent)]">
                        <CreditCardIcon className="mr-2" />
                        Billing
                      </Link>
                    </li>
                  </ul>
                  <hr />
                  <button
                    onClick={() => {
                      logout();
                      navigate('/account');
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <PowerSettingsNewIcon className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/account" className="text-[var(--color-background)] hover:text-[var(--color-accent)]">
              <AccountCircleIcon fontSize="large" />
            </Link>
          )}
          <Link to="/wishlist" className="relative text-[var(--color-background)] hover:text-[var(--color-accent)]">
            <FavoriteIcon fontSize="large" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative text-[var(--color-background)] hover:text-[var(--color-accent)]">
            <ShoppingCartIcon fontSize="large" />
            {cartItems.length > 0 && ( // Display cart count dynamically
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-md">
          <div className="flex flex-col space-y-4 px-4 py-6">            {/* Search Bar */}
            <div className="w-full">
              <SearchBar className="w-full" placeholder="Search products, brands, categories..." />
            </div>

            {/* Links */}
            <Link to="/account/myDetails" className="text-gray-600 hover:text-[var(--color-accent)] flex items-center">
              <AccountCircleIcon className="mr-2" />
              Account
            </Link>
            <Link to="/wishlist" className="text-gray-600 hover:text-[var(--color-accent)] flex items-center">
              <FavoriteIcon className="mr-2" />
              Wishlist
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-[var(--color-accent)] flex items-center">
              <ShoppingCartIcon className="mr-2" />
              Cart ({cartItems.length})
            </Link>

            {/* Departments - Show in mobile menu */}
            <div className="flex flex-wrap gap-2 mt-4">
              {departments.map((department, deptIndex) => (
                <button
                  key={deptIndex}
                  className="text-gray-600 hover:text-[var(--color-accent)] font-bold border border-gray-200 rounded px-3 py-1"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(`/products?department=${department.department}`);
                  }}
                >
                  {department.department.charAt(0).toUpperCase() + department.department.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="hidden lg:block border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center py-3">
          <div className="flex space-x-8">
            {/* Individual Department Buttons */}
            {departments.map((department, deptIndex) => (
              <button
                key={deptIndex}
                className="text-gray-600 hover:text-[var(--color-accent)] font-bold"
                onClick={() => navigate(`/products?department=${department.department}`)} // Navigate on click
              >
                {department.department.charAt(0).toUpperCase() + department.department.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;