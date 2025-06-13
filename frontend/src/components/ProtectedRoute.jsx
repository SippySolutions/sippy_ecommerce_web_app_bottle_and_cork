import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Import AuthContext

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext); // Get authentication status from AuthContext

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect to the login page
    return <Navigate to="/account" replace />;
  }

  // If the user is authenticated, render the child component
  return children;
};

export default ProtectedRoute;