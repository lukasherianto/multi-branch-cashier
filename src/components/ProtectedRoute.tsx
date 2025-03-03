
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to the login page with a return path
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have the required role, redirect to home
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
