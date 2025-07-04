import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion'; // Import framer-motion components
import Home from './pages/Home.jsx';
import AllProducts from './pages/AllProducts';
import SingleProduct from './pages/SingleProduct';
import Collections from './pages/Collections';
import AllCollections from './pages/AllCollections';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Account from './pages/Account.jsx';
import AuthProvider from './components/AuthContext.jsx';
import Cart from './pages/Cart.jsx';
import {CartProvider} from './Context/CartContext.jsx';
import {CMSProvider} from './Context/CMSContext.jsx';
import {AgeVerificationProvider, useAgeVerification} from './Context/AgeVerificationContext.jsx';
import {WishlistProvider} from './Context/WishlistContext.jsx';
import {NotificationProvider} from './Context/NotificationContext.jsx';
import {RealTimeOrderProvider} from './Context/RealTimeOrderContext.jsx';
import useThemePreview from './hooks/useThemePreview.js';
import AgeVerification from './components/AgeVerification.jsx';
import AgeDenied from './components/AgeDenied.jsx';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import Checkout from './pages/Checkout.jsx';
import Wishlist from './pages/Wishlist.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import NetworkStatus from './components/NetworkStatus.jsx';
import StatusBarManager from './components/StatusBarManager.jsx';
import KeyboardManager from './components/KeyboardManager.jsx';
import iOSStatusBarFill from './components/iOSStatusBarFill.jsx';
import NavbarHeightManager from './components/NavbarHeightManager.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import InlineLoader from './components/InlineLoader.jsx';
import LiveOrderNotifications from './components/LiveOrderNotifications.jsx';
import UpdateDialog from './components/UpdateDialog.jsx';
import useAppUpdate from './hooks/useAppUpdate.js';

function AppContent() {
    const location = useLocation();
    const {isVerified, isDenied, isLoading, handleVerified, handleDenied} = useAgeVerification();
    const { updateAvailable, updateInfo, redirectToPlayStore, dismissUpdate } = useAppUpdate();
    
    // Initialize theme preview functionality
    useThemePreview();
    
    // Animation variants for route transitions - Faster animations
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 10
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.15
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.15
            }
        }
    };    // Show loading state - Use branded loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <InlineLoader 
                    text="Initializing Universal Liquors..." 
                    size="lg"
                />
            </div>
        );
    }

    // Show age denied page
    if (isDenied) {
        return <AgeDenied/>;
    }

    // Show age verification modal
    if (!isVerified) {
        return <AgeVerification onVerified={handleVerified} onDenied={handleDenied}/>;
    }    // Show main app content if age verified
    return (
        <NetworkStatus>
            <StatusBarManager />
            <KeyboardManager />
            <iOSStatusBarFill />
            <NavbarHeightManager />
            <Navbar />
            <main className="min-h-screen mobile-full-height mobile-body-padding mobile-content-container mobile-long-content mobile-viewport-fix md:pb-0 ios-status-bar-integration">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route
                            path="/"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <Home />
                                </motion.div>
                            }
                        />
                        <Route
                            path="/products"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <AllProducts />
                                </motion.div>
                            }
                        />
                        <Route
                            path="/products/:id"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <SingleProduct />
                                </motion.div>
                            }
                        />
                        <Route
                            path="/collections/:groupId"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <Collections />
                                </motion.div>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <Cart />
                                </motion.div>
                            }
                        />
                        <Route
                            path="/account"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <Account />
                                </motion.div>
                            }
                        />                        <Route
                            path="/checkout"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <Checkout />
                                </motion.div>
                            }
                        />                        <Route
                            path="/wishlist"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <Wishlist />
                                </motion.div>
                            }
                        />
                        <Route
                            path="/orders/:orderId"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <OrderTracking />
                                </motion.div>
                            }
                        />
                        <Route
                            path="/account/:section"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                </motion.div>
                            }
                        />
                        <Route
                            path="/collections"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <AllCollections />
                                </motion.div>
                            }                        />
                        <Route
                            path="/terms-and-conditions"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <TermsAndConditions />
                                </motion.div>
                            }
                        />
                        <Route
                            path="/privacy-policy"
                            element={
                                <motion.div
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <PrivacyPolicy />
                                </motion.div>
                            }
                        />
                    </Routes></AnimatePresence>
                {/* Live Order Notifications */}
                <LiveOrderNotifications />
            </main>
            <BottomNavigation />
            <Footer />
            <ToastContainer />
            
            {/* App Update Dialog */}
            <UpdateDialog
                isOpen={updateAvailable}
                updateInfo={updateInfo}
                onUpdate={redirectToPlayStore}
                onDismiss={dismissUpdate}
                onLater={dismissUpdate}
            />
        </NetworkStatus>
    );
}

function App() {
    return (
        <CMSProvider>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                        <NotificationProvider>
                            <RealTimeOrderProvider>
                                <AgeVerificationProvider>
                                    <NetworkStatus>
                                        <AppContent />
                                    </NetworkStatus>
                                </AgeVerificationProvider>
                            </RealTimeOrderProvider>
                        </NotificationProvider>
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </CMSProvider>
    );
}

export default App;