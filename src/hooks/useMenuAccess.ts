
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

interface MenuAccess {
  menu_code: string;
}

export const useMenuAccess = () => {
  const { user, userRole } = useAuth();
  const [allowedMenu, setAllowedMenu] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenuAccess = async () => {
      setIsLoading(true);
      try {
        if (user && userRole) {
          const { data, error } = await supabase
            .from('menu_access')
            .select('menu_code')
            .eq('role', userRole)
            .returns<MenuAccess[]>();

          if (error) {
            console.error("Error fetching menu access:", error);
            return;
          }

          const menuCodes = data.map(item => item.menu_code);
          setAllowedMenu(menuCodes);
        } else {
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
