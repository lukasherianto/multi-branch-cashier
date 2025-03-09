
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const isLoading = authLoading;

  // Add debugging
  console.log('ProtectedRoute checking access:', { 
    path: location.pathname,
    isLoading,
    authLoading,
    user: !!user
  });

  // If loading is taking too long, add a 3-second timeout
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout triggered, forcing continuation');
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Wait for loading only if user is unknown
  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to auth');
    // Redirect to the login page with a return path
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, grant access to all routes
  console.log('User is authenticated, allowing access to all routes');
  return <>{children}</>;
}

export default ProtectedRoute;
