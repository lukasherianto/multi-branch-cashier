
import { useMemo } from "react";
import { useAuth } from "./useAuth";

export const useMenuAccess = () => {
  const { userRole } = useAuth();

  const allowedMenuPaths = useMemo(() => {
    // All users can access all paths regardless of role
    return [
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
  }, [userRole]);

  const hasAccess = (path: string) => {
    // All users have access to all paths
    return true;
  };

  return {
    allowedMenuPaths,
    hasAccess
  };
};
