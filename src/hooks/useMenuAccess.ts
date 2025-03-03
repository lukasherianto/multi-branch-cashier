
import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { UserRole } from "@/types/auth";

export const useMenuAccess = () => {
  const { userRole } = useAuth();

  const allowedMenuPaths = useMemo(() => {
    const allPaths = [
      '/',                    // Dashboard
      '/products',            // Product List
      '/products/categories', // Product Categories
      '/stock-transfer',      // Stock Transfer
      '/pos',                 // POS
      '/history',             // Transaction History
      '/returns',             // Returns
      '/kas',                 // Cash
      '/kas/purchases',       // Purchases
      '/reports',             // Reports
      '/branches',            // Branches
      '/attendance',          // Attendance
      '/members',             // Members
      '/settings',            // Settings
    ];

    // Pelaku Usaha (Business Owner) can access everything
    if (userRole === 'pelaku_usaha') {
      return allPaths;
    }
    
    // Admin can access everything except POS
    if (userRole === 'admin') {
      return allPaths.filter(path => path !== '/pos');
    }
    
    // Kasir (Cashier) can only access POS, History, Returns, and Attendance
    if (userRole === 'kasir') {
      return ['/', '/pos', '/history', '/returns', '/attendance'];
    }
    
    // Pelayan (Waiter) - permissions not specified, so let's give minimal access for now
    if (userRole === 'pelayan') {
      return ['/', '/attendance'];
    }
    
    // Default - if role is unknown or user is not logged in
    return ['/'];
  }, [userRole]);

  const hasAccess = (path: string) => {
    // Check if the path (or a parent path) is in allowedMenuPaths
    return allowedMenuPaths.some(allowedPath => {
      // Exact match
      if (path === allowedPath) return true;
      
      // Check if path is a sub-path of an allowed path
      // For example, '/products/edit/1' should be allowed if '/products' is allowed
      if (path.startsWith(allowedPath + '/')) return true;
      
      return false;
    });
  };

  return {
    allowedMenuPaths,
    hasAccess
  };
};
