import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { AuthContext } from './AuthContext';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useCMS } from '../Context/CMSContext';
import SearchBar from './SearchBar';
import InlineLoader from './InlineLoader';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ListIcon from '@mui/icons-material/List';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ViewListIcon from '@mui/icons-material/ViewList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fetchDepartments } from '../services/api.jsx';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useCart();
  const { getWishlistCount } = useWishlist();
  const { 
    cmsData, 
    loading: cmsLoading, 
    getLogo, 
    getStoreInfo, 
    getCurrentStoreStatus 
  } = useCMS();
  
  const wishlistCount = getWishlistCount();
  
  // State hooks
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredDepartment, setHoveredDepartment] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';
  
  // Derived values (computed after all hooks)
  const storeStatus = getCurrentStoreStatus();
  const safeCategories = Array.isArray(departments) ? departments.filter(dept => dept && dept.department).map(dept => ({
    ...dept,
    name: dept.department,
    subcategories: dept.categories || []
  })) : [];

  // useEffect must be called before any conditional returns
  useEffect(() => {
    const getDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const response = await fetchDepartments();
        
        if (response && response.success && Array.isArray(response.departments)) {
          setDepartments(response.departments);
        } else {
          setDepartments([]);
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        setDepartments([]);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    getDepartments();
  }, []);

  // Helper functions
  const getTodaysHours = () => {
    const storeInfo = getStoreInfo();
    if (!storeInfo?.storeHours) return null;
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const todayHours = storeInfo.storeHours[today];
    
    if (todayHours && todayHours.open && todayHours.close) {
      return `${todayHours.open} - ${todayHours.close}`;
    }
    return null;
  };

  const formatPhone = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <>
      {/* Show loading state if CMS is loading */}
      {cmsLoading ? (
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
            <div className="animate-pulse bg-gray-200 h-24 w-24 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-64 rounded"></div>
            <div className="flex space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
            </div>
          </div>
        </nav>
      ) : (
        <>
          {/* Top Info Bar */}
          <div className="hidden md:block bg-[var(--color-accent)] text-white text-xs py-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div className="flex items-center space-x-4 lg:space-x-6">
                {getTodaysHours() && (
                  <div className="flex items-center space-x-1">
                    <AccessTimeIcon fontSize="small" />
                    <span className="hidden lg:inline">Today: </span>
                    <span>{getTodaysHours()}</span>
                  </div>
                )}
                
                {getStoreInfo()?.phone && (
                  <a 
                    href={`tel:${getStoreInfo().phone}`} 
                    className="flex items-center space-x-1 hover:text-yellow-400 transition-colors"
                  >
                    <PhoneIcon fontSize="small" />
                    <span>{formatPhone(getStoreInfo().phone)}</span>
                  </a>
                )}
              </div>
              
              <div className="flex items-center space-x-4 lg:space-x-6">
                {getStoreInfo()?.address && (
                  <div className="flex items-center space-x-1">
                    <LocationOnIcon fontSize="small" />
                    <span className="max-w-32 lg:max-w-64 truncate">
                      {window.innerWidth >= 1024 
                        ? `${getStoreInfo().address.street}, ${getStoreInfo().address.city}, ${getStoreInfo().address.state} ${getStoreInfo().address.zipCode}`
                        : getStoreInfo().address.street
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1 bg-white p-2 rounded-2xl">
                  {storeStatus?.isOpen ? (
                    <span className="text-green-400 font-medium">● OPEN</span>
                  ) : (
                    <span className="text-red-400 font-medium">● CLOSED</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className={`bg-white shadow-md sticky z-40 ${
            typeof window !== 'undefined' && document.documentElement.classList.contains('capacitor-app') 
              ? 'top-6' // 24px = 1.5rem = top-6 for status bar height in Capacitor apps
              : 'top-0' // Normal top-0 for web browsers
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-2 md:py-3">
              {/* Logo */}
              <Link to="/" className="flex items-center text-3xl font-bold text-[var(--color-accent)]">
                {!cmsLoading && getLogo() ? (
                  <img
                    src={getLogo()}
                    alt="Store Logo"
                    className="h-16 w-auto mr-2"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 animate-pulse rounded mr-2"></div>
                )}
              </Link>

              {/* Desktop Search Bar */}
              <div className="hidden lg:flex items-center w-full max-w-2xl mx-4">
                <SearchBar className="w-full" placeholder="Search products, brands, categories..." />
              </div>

              {/* Mobile Navigation Icons */}
              <div className="lg:hidden flex items-center space-x-3 ml-auto">
                <Link to="/cart" className="relative flex flex-col items-center">
                  <ShoppingCartIcon fontSize="medium" className="text-gray-600 hover:text-[var(--color-accent)]" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Link>
                <Link to="/wishlist" className="relative flex flex-col items-center">
                  <FavoriteIcon fontSize="medium" className="text-gray-600 hover:text-[var(--color-accent)]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/account" className="flex flex-col items-center">
                  <AccountCircleIcon fontSize="medium" className="text-gray-600 hover:text-[var(--color-accent)]" />
                </Link>
                
                <button
                  className="text-gray-600 hover:text-[var(--color-accent)]"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
                </button>
              </div>

              {/* Desktop Icons */}
              <div className="hidden lg:flex items-center space-x-6 relative">
                {user ? (
                  <div
                    className="relative cursor-pointer flex flex-col items-center"
                    onClick={() => setDropdownOpen(!dropdownOpen)}    
                  >
                    <AccountCircleIcon fontSize="large" className="text-[var(--color-background)] hover:text-[var(--color-accent)]" />
                    <span className="text-xs text-[var(--color-background)] mt-1">Profile</span>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                        <p className="px-4 py-2 text-gray-700 font-bold">{user.name}</p>
                        <hr />
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
                        <ul className="space-y-2 px-4 py-2">
                          <li>
                            <Link to="/terms-and-conditions" className="flex items-center text-gray-700 hover:text-[var(--color-accent)]">
                              <ViewListIcon className="mr-2" />
                              Terms & Conditions
                            </Link>
                          </li>
                          <li>
                            <Link to="/privacy-policy" className="flex items-center text-gray-700 hover:text-[var(--color-accent)]">
                              <ViewListIcon className="mr-2" />
                              Privacy Policy
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
                  <Link to="/account" className="text-[var(--color-background)] hover:text-[var(--color-accent)] flex flex-col items-center">
                    <AccountCircleIcon fontSize="large" />
                    <span className="text-xs text-[var(--color-background)] mt-1">Login</span>
                  </Link>
                )}
                <Link to="/wishlist" className="relative text-[var(--color-background)] hover:text-[var(--color-accent)] flex flex-col items-center">
                  <div className="relative">
                    <FavoriteIcon fontSize="large" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-background)] mt-1">Wishlist</span>
                </Link>
                <Link to="/cart" className="relative text-[var(--color-background)] hover:text-[var(--color-accent)] flex flex-col items-center">
                  <div className="relative">
                    <ShoppingCartIcon fontSize="large" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                        {cartItems.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-background)] mt-1">Cart</span>
                </Link>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden bg-white shadow-md border-t border-gray-200">
                <div className="flex flex-col space-y-4 px-4 py-6">
                  <div className="w-full">
                    <SearchBar className="w-full" placeholder="Search products, brands, categories..." />
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to="/"
                      className="flex-1 text-center py-2 px-4 border border-gray-200 rounded-lg text-gray-600 hover:text-[var(--color-accent)] font-medium text-sm transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <HomeIcon fontSize="small" className="mr-1" />
                      Home
                    </Link>
                    <Link
                      to="/products"
                      className="flex-1 text-center py-2 px-4 border border-gray-200 rounded-lg text-gray-600 hover:text-[var(--color-accent)] font-medium text-sm transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Shop
                    </Link>
                    <Link
                      to="/collections"
                      className="flex-1 text-center py-2 px-4 border border-gray-200 rounded-lg text-gray-600 hover:text-[var(--color-accent)] font-medium text-sm transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Collections
                    </Link>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Shop by Category
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {safeCategories && safeCategories.length > 0 ? safeCategories.map((department, deptIndex) => (
                        <button
                          key={deptIndex}
                          className="text-left text-gray-600 hover:text-[var(--color-accent)] font-medium border border-gray-200 rounded-lg px-3 py-2 text-sm transition-colors duration-200"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate(`/products?department=${department.department}`);
                          }}
                        >
                          {department.department}
                        </button>
                      )) : (
                        <div className="col-span-2 py-4">
                          <InlineLoader 
                            size="small" 
                            text="Loading categories..." 
                            className="justify-center"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex space-x-2">
                      <Link
                        to="/terms-and-conditions"
                        className="flex-1 text-center py-2 px-4 border border-gray-200 rounded-lg text-gray-600 hover:text-[var(--color-accent)] font-medium text-sm transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Terms & Conditions
                      </Link>
                      <Link
                        to="/privacy-policy"
                        className="flex-1 text-center py-2 px-4 border border-gray-200 rounded-lg text-gray-600 hover:text-[var(--color-accent)] font-medium text-sm transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Privacy Policy
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700">
                        {getStoreInfo()?.name || 'Store'}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center justify-center space-x-1">
                        {storeStatus?.isOpen ? (
                          <span className="text-green-600 font-medium">● Open</span>
                        ) : (
                          <span className="text-red-600 font-medium">● Closed</span>
                        )}
                        {getTodaysHours() && (
                          <span>• {getTodaysHours()}</span>
                        )}
                      </div>
                    </div>
                    
                    {getStoreInfo() && (
                      <div className="flex justify-center space-x-4 text-xs text-gray-600">
                        {getStoreInfo().phone && (
                          <a 
                            href={`tel:${getStoreInfo().phone}`} 
                            className="flex items-center space-x-1 hover:text-[var(--color-accent)] transition-colors"
                          >
                            <PhoneIcon fontSize="small" />
                            <span>{formatPhone(getStoreInfo().phone)}</span>
                          </a>
                        )}
                        {getStoreInfo().address && (
                          <div className="flex items-center space-x-1">
                            <LocationOnIcon fontSize="small" />
                            <span className="truncate max-w-32" title={`${getStoreInfo().address.street}, ${getStoreInfo().address.city}, ${getStoreInfo().address.state} ${getStoreInfo().address.zipCode}`}>
                              {getStoreInfo().address.street}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Section - Enhanced Navigation */}
            <div className="hidden lg:block border-t border-gray-300 bg-gradient-to-r from-gray-50 to-white relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isHomePage ? (
                  <div className="flex items-center justify-center py-3">
                    <motion.div 
                      className="flex items-center space-x-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          to="/products" 
                          className="flex items-center text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-100"
                        >
                          All Products
                        </Link>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          to="/collections" 
                          className="flex items-center text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-100"
                        >
                          Collections
                        </Link>
                      </motion.div>
                      
                      {departmentsLoading ? (
                        <InlineLoader 
                          size="small" 
                          text="Loading departments..." 
                          className="flex items-center space-x-2"
                        />
                      ) : safeCategories && safeCategories.length > 0 ? (
                        <AnimatePresence>
                          {safeCategories.map((department, deptIndex) => (
                            <motion.div
                              key={deptIndex}
                              className="relative"
                              onMouseEnter={() => setHoveredDepartment(deptIndex)}
                              onMouseLeave={() => setHoveredDepartment(null)}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: deptIndex * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <button
                                className="px-4 py-2 text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200  border-b-white border-b-2 hover:border-b-[var(--color-accent)]"
                                onClick={() => navigate(`/products?department=${department.department}`)}
                              >
                                {department.department.toUpperCase()}
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      ) : (
                        <div className="text-gray-500 text-sm">No departments available</div>
                      )}
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-3">
                    <motion.div 
                      className="flex items-center space-x-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          to="/" 
                          className="flex items-center text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-100"
                        >
                          <HomeIcon className="mr-1" fontSize="small" />
                          Home
                        </Link>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          to="/products" 
                          className="flex items-center text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-100"
                        >
                          All Products
                        </Link>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          to="/collections" 
                          className="flex items-center text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-100"
                        >
                          Collections
                        </Link>
                      </motion.div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center space-x-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {departmentsLoading ? (
                        <InlineLoader 
                          size="small" 
                          text="Loading departments..." 
                          className="flex items-center space-x-2"
                        />
                      ) : safeCategories && safeCategories.length > 0 ? (
                        <>
                          {safeCategories.slice(0, 6).map((department, deptIndex) => (
                            <motion.div
                              key={deptIndex}
                              className="relative"
                              onMouseEnter={() => setHoveredDepartment(deptIndex)}
                              onMouseLeave={() => setHoveredDepartment(null)}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: deptIndex * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <button
                                className="px-4 py-2 text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200 border-b-white border-b-2 hover:border-b-[var(--color-accent)]"
                                onClick={() => navigate(`/products?department=${department.department}`)}
                              >
                                {department.department.toUpperCase()}
                              </button>
                            </motion.div>
                          ))}
                          
                          {safeCategories.length > 6 && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.6 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Link 
                                to="/products" 
                                className="px-4 py-2 text-gray-500 hover:text-[var(--color-accent)] font-medium text-sm transition-colors duration-200"
                              >
                                More Departments →
                              </Link>
                            </motion.div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-500 text-sm">No departments available</div>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Width Mega Menu Dropdown - Positioned correctly */}
            <AnimatePresence>
              {hoveredDepartment !== null && departments[hoveredDepartment] && departments[hoveredDepartment].categories && departments[hoveredDepartment].categories.length > 0 && (
                <motion.div 
                  className="h-[70vh] w-[50vw] absolute left-[25vw] bg-white  shadow-lg z-50 overflow-hidden"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onMouseEnter={() => setHoveredDepartment(hoveredDepartment)}
                  onMouseLeave={() => setHoveredDepartment(null)}
                >
                  <div className="p-4 h-full overflow-y-auto">
                    <div className="grid grid-cols-5 gap-4">
                      {departments[hoveredDepartment].categories
                        .filter(cat => cat.category && cat.category !== null)
                        .map((category, catIndex) => (
                        <div key={catIndex} className=" pr-4">
                          <h3 
                            className="font-semibold text-gray-950 mb-2 cursor-pointer hover:text-[var(--color-accent)]"
                            onClick={() => {
                              navigate(`/products?department=${departments[hoveredDepartment].department}&category=${category.category}`);
                              setHoveredDepartment(null);
                            }}
                          >
                            {category.category.toUpperCase()}
                          </h3>
                          
                          {category.subcategories && category.subcategories.length > 0 && (
                            <div className="space-y-1">
                              {category.subcategories.map((subcategory, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="text-sm text-gray-600 cursor-pointer hover:text-[var(--color-accent)]"
                                  onClick={() => {
                                    navigate(`/products?department=${departments[hoveredDepartment].department}&category=${category.category}&subcategory=${subcategory}`);
                                    setHoveredDepartment(null);
                                  }}
                                >
                                  {subcategory}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </>
      )}
    </>
  );
}

export default Navbar;
