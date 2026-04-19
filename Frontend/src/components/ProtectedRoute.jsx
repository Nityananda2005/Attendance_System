import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If there's no token or user, go to splash page
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Check for profile completion and Approval for Students
  if (user.role === 'student' && location.pathname !== '/profile') {
    const requiredFields = ['department', 'semester', 'batchSection', 'residence', 'phone'];
    const isComplete = requiredFields.every(field => user[field] && user[field].toString().trim() !== '');
    
    if (!isComplete) {
      toast.error("Please complete your profile details first!", { id: 'profile-warning' });
      return <Navigate to="/profile" replace />;
    }

    // Check for Approval Status
    if (user.approvalStatus !== 'approved') {
      return <Navigate to="/profile" replace />;
    }
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
