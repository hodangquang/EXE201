import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/constants';

export const ProtectedRoute = ({ requiredRole, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if ((requiredRole && user?.role !== requiredRole) || (allowedRoles && !allowedRoles.includes(user?.role))) {
    return <Navigate to={user?.role === ROLES.SHIPPER ? '/shipper/orders' : user?.role === ROLES.ADMIN ? '/dashboard' : user?.role === ROLES.STAFF ? '/collections/sourcing' : '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
