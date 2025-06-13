import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import Profile from '../components/Profile'; // Import Profile component
import { AuthContext } from '../components/AuthContext'; // Import AuthContext as named export

const Account = () => {
    const context = useContext(AuthContext);
    
    // Check if AuthContext is available
    if (!context) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
                    <p className="text-gray-600">AuthContext is not available. Please check your app setup.</p>
                </div>
            </div>
        );
    }    const { user, login, isAuthenticated } = context; // Use AuthContext to get user and login function
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on component mount
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !user) {
            // If there's a token but no user, wait for AuthContext to load user
            setTimeout(() => setIsLoading(false), 1000);
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    // Animation variants for the form
    const formVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 },
    };

    // Animation variants for the right section
    const rightSectionVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };    // Simulate login success (replace with real authentication logic)
    const handleLoginSuccess = (userData, token) => {
        login(userData, token); // Call login function from AuthContext
        setIsLoading(false);
    };

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }return (
        <div className="flex min-h-screen overflow-hidden">
            {isAuthenticated ? (
                // Show Profile component if logged in
                <Profile />
            ) : (
                <>
                    {/* Left Section: Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-8">
                        <div className="w-full max-w-md">
                            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
                                {isLogin ? 'Welcome Back!' : 'Create an Account'}
                            </h1>
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div
                                        key="login"
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={formVariants}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <LoginForm onLoginSuccess={handleLoginSuccess} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="signup"
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={formVariants}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <SignupForm />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Section: Image and Message */}
                    <motion.div
                        style={{
                            backgroundImage:
                                'url(https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/account/AccountBg.avif)',
                        }}
                        className="hidden lg:flex w-1/2 items-center justify-center bg-[var(--color-background)]/40 text-white p-8"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={rightSectionVariants}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-[var(--color-background)]/40 backdrop-blur-sm p-8 rounded-lg shadow-lg">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold mb-4">
                                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                                </h2>
                                <p className="mb-6">
                                    {isLogin
                                        ? 'Sign up now to start your journey with us!'
                                        : 'Log in to access your account and continue where you left off.'}
                                </p>
                                <button
                                    onClick={toggleForm}
                                    className="bg-[var(--color-accent)] text-[var(--color-headingText)] font-bold py-2 px-4 rounded-md shadow-md hover:bg-[var(--color-background)]"
                                >
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default Account;