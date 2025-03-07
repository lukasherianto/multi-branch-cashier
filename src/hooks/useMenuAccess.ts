
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
      console.log("Fetching menu access for role:", userRole);
      
      try {
        if (userRole) {
          // Query the menu_access table for the current user role
          const { data, error } = await supabase
            .from('menu_access')
            .select('menu_code')
            .eq('role', userRole);

          if (error) {
            console.error("Error fetching menu access:", error);
            setAllowedMenu([]);
            return;
          }
          
          // Extract the menu codes from the response
          const menuCodes = (data as MenuAccessData[]).map(item => item.menu_code);
          console.log("Menu access data fetched:", menuCodes);
          setAllowedMenu(menuCodes);
        } else {
          // Default empty array if no user role
          console.log("No user role, setting empty menu access");
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
