import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ user, requiredRole, children }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = (user?.role || '').trim().toUpperCase();
  const targetRole = (requiredRole || '').trim().toUpperCase();

  // Strict role check
  if (targetRole && userRole !== targetRole) {
    // If Officer tries to access Admin route, strictly bounce to /officer/dashboard
    if (userRole === 'OFFICER') {
      return <Navigate to="/officer/dashboard" replace />;
    }
    // If Admin tries to access Officer route, redirect to /admin/dashboard
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
