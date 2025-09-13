import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    console.log('[ProtectedRoute] User does not have required roles:', allowedRoles);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}