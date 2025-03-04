
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMenuAccess } from "../hooks/useMenuAccess";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // We'll keep this prop for compatibility, but we'll use our enhanced access control
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const { hasAccess, isLoading: accessLoading } = useMenuAccess();
  const location = useLocation();
  const isLoading = authLoading || accessLoading;

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

  // Business owners (pelaku_usaha) always have access to all routes
  if (userRole === 'pelaku_usaha') {
    return <>{children}</>;
  }

  // For other roles, check if the user has access to the current path
  if (!hasAccess(location.pathname)) {
    // Redirect to the dashboard if they don't have access
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has access to this route
  return <>{children}</>;
}

export default ProtectedRoute;
