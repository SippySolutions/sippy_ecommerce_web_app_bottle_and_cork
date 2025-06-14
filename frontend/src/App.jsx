import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { StrictMode } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // Import framer-motion components
import Home from './pages/Home.jsx';
import AllProducts from './pages/AllProducts';
import SingleProduct from './pages/SingleProduct';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Account from './pages/Account.jsx';
import AuthProvider from './components/AuthContext.jsx';
import Cart from './pages/Cart.jsx';
import { CartProvider } from './Context/CartContext.jsx';
import { CMSProvider } from './Context/CMSContext.jsx'; // Import CMS Provider
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import Checkout from './pages/Checkout.jsx';

function App() {
    const location = useLocation(); // Get the current location

    // Animation variants for route transitions
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20,
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: { duration: 0.3 },
        },
    };

    return (
        <CMSProvider>
            <AuthProvider>
                <CartProvider>
                    <Navbar />
                    <main className="min-h-screen">
                        <AnimatePresence mode="wait"> {/* AnimatePresence for route transitions */}
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
                                    />
                                    <Route
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
                                    />                    <Route
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
                                </Routes>                            </AnimatePresence>
                        </main>
                        <Footer />
                        <ToastContainer />
                    </CartProvider>
                </AuthProvider>
            </CMSProvider>
    );
}

export default App;