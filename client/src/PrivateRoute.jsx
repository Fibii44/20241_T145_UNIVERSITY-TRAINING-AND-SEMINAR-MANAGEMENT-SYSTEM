import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Utility function to check token expiry
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime; // Token is expired if 'exp' < current time
  } catch (error) {
    console.error("Token validation error:", error);
    return true; // Treat invalid tokens as expired
  }
};

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  if (!token || isTokenExpired(token)) {
    // Clear token and redirect to login
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    console.warn("Token expired or missing. Redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  // Decode token to verify user role
  const decoded = jwtDecode(token);
  if (!allowedRoles.includes(decoded.role)) {
    console.warn("Unauthorized access. Redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  return children; // Render protected content
};

export default PrivateRoute;
