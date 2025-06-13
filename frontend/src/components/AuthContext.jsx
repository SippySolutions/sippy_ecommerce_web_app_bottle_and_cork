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
        .catch(() => setUser(null));
    }
  }, []);

  // Update user details
  const updateUser = async (updates) => {
    const data = await updateUserProfile(updates);
    setUser(data.user);
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
  };
  // Refresh user from backend
  const refreshUser = async () => {
    const data = await fetchUserProfile();
    setUser(data.user);
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