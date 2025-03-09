
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth";

interface MenuAccessData {
  menu_code: string;
}

export const useMenuAccess = () => {
  const { userRole } = useAuth();
  const [allowedMenu, setAllowedMenu] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMenuAccess = async () => {
      setIsLoading(true);
      
      try {
        // For a single business owner, we assume access to all menus
        // Get all menu codes from menuConfig.ts
        // This approach ensures the owner has full access
        const allMenuCodes = [
          'dashboard',
          'products',
          'products_categories',
          'stock_transfer',
          'pos',
          'history',
          'returns',
          'kas',
          'purchases',
          'reports',
          'branches',
          'attendance',
          'members',
          'settings'
        ];
        
        console.log("Menu access for owner granted:", allMenuCodes);
        setAllowedMenu(allMenuCodes);
        
      } catch (err) {
        console.error("Unexpected error in menu access:", err);
        setAllowedMenu([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuAccess();
  }, [userRole]);

  return { allowedMenu, isLoading };
};
