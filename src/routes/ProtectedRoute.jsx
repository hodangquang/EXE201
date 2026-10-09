import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/constants';

export const ProtectedRoute = ({ requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If Staff tries to access an Admin-only route, redirect to Collections
    return <Navigate to="/collections" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
