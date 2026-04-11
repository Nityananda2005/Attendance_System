import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If there's no token or user, go to splash page
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // If route requires specific roles
  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.some(role => role.toLowerCase() === user.role.toLowerCase())) {
      // Redirect to their respective dashboard
      return <Navigate to={user.role.toLowerCase() === 'faculty' ? "/faculty-dashboard" : "/dashboard"} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
