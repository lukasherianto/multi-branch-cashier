
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./types";

export const useUserRole = (user: User | null) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userStatusId, setUserStatusId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setUserStatusId(null);
        return;
      }

      // Get user role from user metadata
      const role = user.user_metadata?.business_role;
      if (role) {
        setUserRole(role as UserRole);
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('business_role, status_id')
          .eq('id', user.id)
          .maybeSingle();

        if (!profileError && profileData) {
          if (profileData.status_id) {
            setUserStatusId(profileData.status_id);
            console.log("User status_id loaded:", profileData.status_id);
          }
          
          // If business_role not in metadata, use from profiles
          if (!role && profileData.business_role) {
            setUserRole(profileData.business_role as UserRole);
            console.log("User role loaded from profiles:", profileData.business_role);
          }
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
      }
    };

    fetchUserRole();
  }, [user]);

  return { userRole, userStatusId, setUserRole, setUserStatusId };
};
