
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useMenuAccess = () => {
  const { user, userRole, userStatusId } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Untuk debugging
  console.log('useMenuAccess hook initialized', { userRole, userStatusId });

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user) {
        setUserPermissions(null);
        setIsLoading(false);
        return;
      }

      // If user is a business owner, we don't need to fetch permissions
      if (userRole === 'pelaku_usaha' || userStatusId === 1) {
        setUserPermissions('Akses penuh');
        setIsLoading(false);
        return;
      }

      try {
        // Use userStatusId directly if available
        if (userStatusId) {
          const { data, error } = await supabase
            .from('user_status')
            .select('wewenang')
            .eq('status_id', userStatusId)
            .maybeSingle();

          if (error) {
            console.error('Error fetching user status:', error);
            setIsLoading(false);
          } else if (data) {
            setUserPermissions(data.wewenang);
            console.log('User permissions loaded:', data.wewenang);
            setIsLoading(false);
          } else {
            // No data found but query was successful
            console.log('No permissions found for status_id:', userStatusId);
            setIsLoading(false);
          }
        } else {
          // Fallback to role-based lookup if statusId not available
          let status_id: number | null = null;
          
          switch (userRole) {
            case 'admin':
              status_id = 2;
              break;
            case 'kasir':
              status_id = 3;
              break;
            case 'pelayan':
              status_id = 4;
              break;
            default:
              status_id = null;
          }

          if (status_id) {
            const { data, error } = await supabase
              .from('user_status')
              .select('wewenang')
              .eq('status_id', status_id)
              .maybeSingle();

            if (error) {
              console.error('Error fetching user status:', error);
            } else if (data) {
              setUserPermissions(data.wewenang);
              console.log('User permissions loaded (fallback):', data.wewenang);
            }
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in fetchUserStatus:', error);
        setIsLoading(false);
      }
    };

    fetchUserStatus();
  }, [user, userRole, userStatusId]);

  // List of all available menu paths in the application
  const allMenuPaths = [
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

  const allowedMenuPaths = useMemo(() => {
    // For business owners (pelaku_usaha), grant access to all menus
    if (userRole === 'pelaku_usaha' || userStatusId === 1) {
      return allMenuPaths;
    }

    // Default paths for any authenticated user
    const defaultPaths = ['/'];

    // If still loading or no permissions specified, return default paths
    if (isLoading || !userPermissions) {
      return defaultPaths;
    }

    // For users with full access
    if (userPermissions.includes('Akses penuh') || userPermissions.includes('Full access')) {
      return allMenuPaths;
    }

    // For admin (access to all except POS)
    if (userPermissions.includes('Akses ke semua fitur kecuali POS')) {
      return [
        '/',                    // Dashboard
        '/products',            // Product List
        '/products/categories', // Product Categories
        '/stock-transfer',      // Stock Transfer
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
    }

    // For cashier (limited access)
    if (userPermissions.includes('Akses terbatas ke POS, Riwayat Transaksi, Absensi, dan Retur')) {
      return [
        '/',                    // Dashboard
        '/pos',                 // POS
        '/history',             // Transaction History
        '/returns',             // Returns
        '/attendance',          // Attendance
      ];
    }

    // For server/waiter (only attendance)
    if (userPermissions.includes('Akses terbatas hanya ke Absensi')) {
      return [
        '/',                    // Dashboard
        '/attendance',          // Attendance
      ];
    }

    // If no specific permissions match, return just the dashboard
    return defaultPaths;
  }, [isLoading, userPermissions, userRole, userStatusId, allMenuPaths]);

  const hasAccess = (path: string) => {
    // Business owners (pelaku_usaha) can access everything
    if (userRole === 'pelaku_usaha' || userStatusId === 1) {
      console.log('Business owner has access to:', path);
      return true;
    }

    // For other roles, check if the path is in the allowed paths
    const hasPathAccess = allowedMenuPaths.includes(path) || 
           allowedMenuPaths.some(allowedPath => 
             path.startsWith(allowedPath + '/'));
    
    console.log(`User with role ${userRole} (status_id: ${userStatusId}) access to ${path}:`, hasPathAccess);
    return hasPathAccess;
  };

  return {
    allowedMenuPaths,
    hasAccess,
    isLoading
  };
};
