import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { AuthContext } from './AuthContext'; // Import AuthContext

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext); // Use login from AuthContext
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    console.log('🔄 Starting login process...', formData);
    
    try {
      console.log('📡 Calling loginUser API...');
      const response = await loginUser(formData); // Call the API function
      console.log('✅ Login API response:', response);

      // Save user and token in AuthContext
      console.log('💾 Saving to AuthContext...');
      login(response.user, response.token);

      // Navigate to the home page
      console.log('🏠 Navigating to home...');
      navigate('/');
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    }
  };
  return (
    <div className="w-full">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-colors duration-200 text-base"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-colors duration-200 text-base"
              placeholder="Enter your password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[var(--color-accent)] text-white py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 transition-all duration-200 font-semibold text-base"
          >
            Sign In
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-[var(--color-accent)] hover:underline">
            Forgot your password?
          </a>
        </div>
      </div>

      {/* Desktop Sign Up Link - Hidden on mobile since parent handles toggle */}
      <div className="hidden lg:block mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <a href="#" className="text-[var(--color-accent)] font-semibold hover:underline">
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;