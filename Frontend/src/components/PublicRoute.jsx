import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, token } = useContext(AuthContext);

  if (token && user) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
