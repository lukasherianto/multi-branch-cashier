
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // List of roles that can access this route
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const isLoading = authLoading;

  // Add debugging
  console.log('ProtectedRoute checking access:', { 
    path: location.pathname,
    isLoading,
    authLoading,
    user: !!user,
    userRole,
    allowedRoles
  });

  // If loadingnya terlalu lama, kita tambahkan maksimal 3 detik
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout triggered, forcing continuation');
      }
    }, 3000); // 3 detik timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Tunggu loading hanya jika user belum diketahui
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

  // Check if there are role restrictions and if the user has the required role
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = userRole && allowedRoles.includes(userRole);
    
    if (!hasAccess) {
      console.log(`User with role ${userRole} does not have access to ${location.pathname}`);
      
      // Redirect to appropriate dashboard based on role
      if (userRole === 'kasir') {
        return <Navigate to="/kasir" replace />;
      }
      
      // Default redirect to home
      return <Navigate to="/" replace />;
    }
  }

  // Direct kasir users to the kasir dashboard if they try to access the main dashboard
  if (userRole === 'kasir' && location.pathname === '/') {
    return <Navigate to="/kasir" replace />;
  }

  // User is authenticated and has required role, grant access
  console.log('User is authenticated and has required role, allowing access');
  return <>{children}</>;
}

export default ProtectedRoute;
