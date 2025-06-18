import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from './AuthContext'; // Import AuthContext
import { useCart } from '../Context/CartContext'; // Import CartContext
import { useWishlist } from '../Context/WishlistContext'; // Import WishlistContext
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
import ViewListIcon from '@mui/icons-material/ViewList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fetchDepartments } from '../services/api.jsx'; // Import your API function

function Navbar() {
  // All hooks must be called at the top level before any conditional logic
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
  const safeDepartments = Array.isArray(departments) ? departments : [];

  // useEffect must be called before any conditional returns (Rules of Hooks)
  useEffect(() => {
    const getDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const data = await fetchDepartments();
        
        if (data && data.departments) {
          setDepartments(data.departments);
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

  // Helper functions defined after hooks
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
          {/* Top Info Bar - Brief Store Information */}
          <div className="hidden md:block bg-[var(--color-accent)]  text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4 lg:space-x-6">
            {/* Store Hours */}
            {getTodaysHours() && (
              <div className="flex items-center space-x-1">
                <AccessTimeIcon fontSize="small" />
                <span className="hidden lg:inline">Today: </span>
                <span>{getTodaysHours()}</span>
              </div>
            )}
            
            {/* Phone */}
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
            {/* Location - More abbreviated on medium screens */}
            {getStoreInfo()?.address && (
              <div className="flex items-center space-x-1">
                <LocationOnIcon fontSize="small" />
                <span className="max-w-32 lg:max-w-64 truncate">
                  {window.innerWidth >= 1024 
                    ? getStoreInfo().address 
                    : getStoreInfo().address.split(',')[0]
                  }
                </span>
              </div>
            )}
            
            {/* Status */}
            <div className="flex items-center space-x-1 bg-white p-2 rounded-2xl">
              {storeStatus?.isOpen ? (
                <span className="text-green-400 font-medium">● OPEN</span>
              ) : (
                <span className="text-red-400 font-medium">● CLOSED</span>
              )}
            </div>
          </div>        </div>
      </div>

      <nav className="bg-white shadow-md sticky top-0 z-40">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">{/* Logo */}
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
        </div>        {/* Icons */}
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
              {cartItems.length > 0 && ( // Display cart count dynamically
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                  {cartItems.length}
                </span>
              )}
            </div>
            <span className="text-xs text-[var(--color-background)] mt-1">Cart</span>
          </Link>
        </div>
      </div>      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-md border-t border-gray-200">
          <div className="flex flex-col space-y-4 px-4 py-6">
            
            {/* Search Bar */}
            <div className="w-full">
              <SearchBar className="w-full" placeholder="Search products, brands, categories..." />
            </div>

            {/* Main Navigation Links */}
            <div className="border-b border-gray-200 pb-4">
              <Link 
                to="/" 
                className="flex items-center text-gray-600 hover:text-[var(--color-accent)] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="mr-3" />
                Home
              </Link>
              <Link 
                to="/products" 
                className="flex items-center text-gray-600 hover:text-[var(--color-accent)] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ViewListIcon className="mr-3" />
                View All Products
              </Link>
            </div>

            {/* Account Links */}
            <div className="border-b border-gray-200 pb-4">
              <Link 
                to="/account/myDetails" 
                className="text-gray-600 hover:text-[var(--color-accent)] flex items-center py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <AccountCircleIcon className="mr-3" />
                Account
              </Link>
              <Link 
                to="/wishlist" 
                className="text-gray-600 hover:text-[var(--color-accent)] flex items-center py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FavoriteIcon className="mr-3" />
                Wishlist ({wishlistCount})
              </Link>
              <Link 
                to="/cart" 
                className="text-gray-600 hover:text-[var(--color-accent)] flex items-center py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCartIcon className="mr-3" />
                Cart ({cartItems.length})
              </Link>
            </div>

            {/* Departments */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Shop by Department
              </h3>              <div className="grid grid-cols-2 gap-2">
                {safeDepartments && safeDepartments.length > 0 ? safeDepartments.map((department, deptIndex) => (
                  <button
                    key={deptIndex}
                    className="text-left text-gray-600 hover:text-[var(--color-accent)] font-medium border border-gray-200 rounded-lg px-3 py-2 text-sm transition-colors duration-200"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(`/products?department=${department.department}`);
                    }}
                  >
                    {department.department.charAt(0).toUpperCase() + department.department.slice(1).toLowerCase()}
                  </button>
                )) : (
                  <div className="col-span-2 text-center text-gray-500 py-4">
                    Loading departments...
                  </div>
                )}
              </div>
            </div>            {/* Store Information */}
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
              
              {/* Contact info for mobile */}
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
                      <span className="truncate max-w-32" title={getStoreInfo().address}>
                        {getStoreInfo().address.split(',')[0]}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}{/* Bottom Section - Enhanced Navigation */}
      <div className="hidden lg:block border-t border-gray-300 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isHomePage ? (
            // Home page layout - center everything
            <div className="flex items-center justify-center py-3">
              <motion.div 
                className="flex items-center space-x-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Show "View All Products" first when on home page */}
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
                
                {departmentsLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  </div>
                ) : safeDepartments && safeDepartments.length > 0 ? (
                  <AnimatePresence>
                    {safeDepartments.map((department, deptIndex) => (
                      <motion.div
                        key={deptIndex}
                        className="relative group"
                        onMouseEnter={() => setHoveredDepartment(deptIndex)}
                        onMouseLeave={() => setHoveredDepartment(null)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: deptIndex * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <button
                          className="px-4 py-2 text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200 rounded-md hover:bg-gray-100"
                          onClick={() => navigate(`/products?department=${department.department}`)}
                        >
                          {department.department.charAt(0).toUpperCase() + department.department.slice(1).toLowerCase()}
                        </button>
                        {/* Dropdown Menu for Categories */}
                        <AnimatePresence>
                          {hoveredDepartment === deptIndex && department.categories && department.categories.length > 0 && (
                            <motion.div 
                              className="dropdown-menu absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[250px] max-w-[400px] overflow-hidden"
                              style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)' }}
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-4">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
                                  {department.department} Categories
                                </div>
                                <div className="grid grid-cols-1 gap-1 max-h-80 overflow-y-auto">
                                  {department.categories
                                    .filter(cat => cat.category && cat.category !== null)
                                    .slice(0, 12)
                                    .map((category, catIndex) => (
                                    <motion.div 
                                      key={catIndex} 
                                      className="group/item"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.2, delay: catIndex * 0.05 }}
                                    >
                                      <button
                                        onClick={() => {
                                          navigate(`/products?department=${department.department}&category=${category.category}`);
                                          setHoveredDepartment(null);
                                        }}
                                        className="category-item w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[var(--color-accent)] rounded-md transition-all duration-200 transform hover:scale-[1.02]"
                                      >
                                        <div className="font-medium">{category.category}</div>
                                        {category.subcategories && category.subcategories.length > 0 && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {category.subcategories.slice(0, 3).join(', ')}
                                            {category.subcategories.length > 3 && '...'}
                                          </div>
                                        )}
                                      </button>
                                    </motion.div>
                                  ))}
                                  {department.categories.filter(cat => cat.category && cat.category !== null).length > 12 && (
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                      <button
                                        onClick={() => {
                                          navigate(`/products?department=${department.department}`);
                                          setHoveredDepartment(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-[var(--color-accent)] hover:bg-blue-50 rounded-md font-medium transition-all duration-200 hover:font-semibold"
                                      >
                                        View All {department.department} Products →
                                      </button>
                                    </div>
                                  )}
                                  
                                  {/* Always show a "View Department" option at the bottom */}
                                  <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button
                                      onClick={() => {
                                        navigate(`/products?department=${department.department}`);
                                        setHoveredDepartment(null);
                                      }}
                                      className="w-full text-center px-3 py-2 text-sm bg-gradient-to-r from-[var(--color-accent)] to-blue-600 text-white rounded-md font-medium transition-all duration-200 hover:shadow-md transform hover:scale-105"
                                    >
                                      Browse All {department.department.charAt(0).toUpperCase() + department.department.slice(1)} →
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-gray-500 text-sm">No departments available</div>
                )}
              </motion.div>
            </div>
          ) : (
            // Non-home page layout - left and center
            <div className="flex items-center justify-between py-3">
              {/* Left side - Home link */}
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
                    className="flex items-center text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200"
                  >
                    <HomeIcon className="mr-1" fontSize="small" />
                    Home
                  </Link>
                </motion.div>
              </motion.div>

              {/* Center - Department Navigation with Dropdowns */}
              <motion.div 
                className="flex items-center space-x-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {departmentsLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  </div>
                ) : safeDepartments && safeDepartments.length > 0 ? (
                  <>
                    {safeDepartments.slice(0, 6).map((department, deptIndex) => (
                      <motion.div
                        key={deptIndex}
                        className="relative group"
                        onMouseEnter={() => setHoveredDepartment(deptIndex)}
                        onMouseLeave={() => setHoveredDepartment(null)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: deptIndex * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <button
                          className="px-4 py-2 text-gray-700 hover:text-[var(--color-accent)] font-bold transition-colors duration-200 rounded-md hover:bg-gray-100"
                          onClick={() => navigate(`/products?department=${department.department}`)}
                        >
                          {department.department.charAt(0).toUpperCase() + department.department.slice(1).toLowerCase()}
                        </button>
                        {/* Dropdown Menu for Categories */}
                        <AnimatePresence>
                          {hoveredDepartment === deptIndex && department.categories && department.categories.length > 0 && (
                            <motion.div 
                              className="dropdown-menu absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[250px] max-w-[400px] overflow-hidden"
                              style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)' }}
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-4">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
                                  {department.department} Categories
                                </div>
                                <div className="grid grid-cols-1 gap-1 max-h-80 overflow-y-auto">
                                  {department.categories
                                    .filter(cat => cat.category && cat.category !== null)
                                    .slice(0, 12)
                                    .map((category, catIndex) => (
                                    <motion.div 
                                      key={catIndex} 
                                      className="group/item"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.2, delay: catIndex * 0.05 }}
                                    >
                                      <button
                                        onClick={() => {
                                          navigate(`/products?department=${department.department}&category=${category.category}`);
                                          setHoveredDepartment(null);
                                        }}
                                        className="category-item w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[var(--color-accent)] rounded-md transition-all duration-200 transform hover:scale-[1.02]"
                                      >
                                        <div className="font-medium">{category.category}</div>
                                        {category.subcategories && category.subcategories.length > 0 && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {category.subcategories.slice(0, 3).join(', ')}
                                            {category.subcategories.length > 3 && '...'}
                                          </div>
                                        )}
                                      </button>
                                    </motion.div>
                                  ))}
                                  {department.categories.filter(cat => cat.category && cat.category !== null).length > 12 && (
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                      <button
                                        onClick={() => {
                                          navigate(`/products?department=${department.department}`);
                                          setHoveredDepartment(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-[var(--color-accent)] hover:bg-blue-50 rounded-md font-medium transition-all duration-200 hover:font-semibold"
                                      >
                                        View All {department.department} Products →
                                      </button>
                                    </div>
                                  )}
                                  
                                  {/* Always show a "View Department" option at the bottom */}
                                  <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button
                                      onClick={() => {
                                        navigate(`/products?department=${department.department}`);
                                        setHoveredDepartment(null);
                                      }}
                                      className="w-full text-center px-3 py-2 text-sm bg-gradient-to-r from-[var(--color-accent)] to-blue-600 text-white rounded-md font-medium transition-all duration-200 hover:shadow-md transform hover:scale-105"
                                    >
                                      Browse All {department.department.charAt(0).toUpperCase() + department.department.slice(1)} →
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                    
                    {/* View More Departments Link - only show when not on home and there are more than 6 departments */}
                    {safeDepartments.length > 6 && (
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
              
              {/* Right side - empty for balance */}
              <div className="flex items-center space-x-6">
                {/* This empty div balances the layout */}
              </div>
            </div>
          )}
        </div>
      </div>
        {/* Custom styles for enhanced dropdown animations and responsive design */}
      <style jsx="true">{`
        .dropdown-menu {
          animation: slideDown 0.2s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .category-item:hover {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }
        
        @media (max-width: 1024px) {
          .department-dropdown {
            display: none;
          }        }      `}</style>
          </nav>
        </>
      )}
    </>
  );
}

export default Navbar;