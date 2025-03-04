import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export const useMenuAccess = () => {
  const { user, userRole } = useAuth();
  const [allowedMenu, setAllowedMenu] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenuAccess = async () => {
      setIsLoading(true);
      try {
        if (user && userRole) {
          // Fetch menu access based on user role
          const { data, error } = await supabase
            .from('menu_access')
            .select('menu_code')
            .eq('role', userRole);

          if (error) {
            console.error("Error fetching menu access:", error);
            return;
          }

          const menuCodes = data.map(item => item.menu_code);
          setAllowedMenu(menuCodes);
        } else {
          // If user or role is not yet available, set to empty array
          setAllowedMenu([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuAccess();
  }, [user, userRole]);

  return { allowedMenu, isLoading };
};

