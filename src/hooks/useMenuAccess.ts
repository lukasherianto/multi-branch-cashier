
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

interface MenuAccessData {
  menu_code: string;
}

export const useMenuAccess = () => {
  const { userRole } = useAuth();
  const [allowedMenu, setAllowedMenu] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenuAccess = async () => {
      setIsLoading(true);
      try {
        if (userRole) {
          // The correct way to query the menu_access table with proper typing
          const { data, error } = await supabase
            .from('menu_access')
            .select('menu_code')
            .eq('role', userRole);

          if (error) {
            console.error("Error fetching menu access:", error);
            setAllowedMenu([]);
            return;
          }
          
          // Correctly type the data and extract menu_code values
          const menuCodes = (data as MenuAccessData[]).map(item => item.menu_code);
          setAllowedMenu(menuCodes);
        } else {
          // Default empty array if no user role
          setAllowedMenu([]);
        }
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
