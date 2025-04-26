
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-brand-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles are required or user role is in allowed roles, render the children
  if (allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole))) {
    return <>{children}</>;
  }

  // If user role doesn't match required roles, redirect to appropriate dashboard
  if (userRole === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin/dashboard" replace />;
  } else if (userRole === 'ORG_ADMIN') {
    return <Navigate to="/org-admin/dashboard" replace />;
  } else if (userRole === 'INDIVIDUAL') {
    return <Navigate to="/individual/dashboard" replace />;
  }

  // Default fallback
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
