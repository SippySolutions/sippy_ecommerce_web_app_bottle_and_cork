import React, { createContext, useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile, deleteUserProfile } from '../services/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Load user from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile()
        .then(setUser)
        .catch((error) => {
          console.error('Error fetching user profile on app load:', error);
          // Only logout if it's a 401 error
          if (error.response?.status === 401) {
            setUser(null);
            localStorage.removeItem('token');
          } else {
            // For other errors, just log them but don't logout
            console.warn('Profile fetch failed but not logging out:', error.message);
          }
        });
    }
  }, []);
  // Update user details
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Delete user
  const deleteUser = async () => {
    await deleteUserProfile();
    setUser(null);
    localStorage.removeItem('token');
  };

  // Login function
  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData)); // Save as JSON string
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };  // Refresh user from backend
  const refreshUser = async () => {
    try {
      const data = await fetchUserProfile();
      setUser(data.user || data); // Handle both data.user and direct data response
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Don't logout on refresh errors unless it's 401
      if (error.response?.status === 401) {
        console.warn('Auth error during refresh, logging out');
        logout();
      }
    }
  };

  // Check if user is authenticated
  const isAuthenticated = Boolean(user && localStorage.getItem('token'));

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      updateUser, 
      deleteUser, 
      login, 
      logout, 
      refreshUser, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;