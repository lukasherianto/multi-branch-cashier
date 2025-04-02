
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userStatusId, setUserStatusId] = useState<number | null>(null);

  // Function to fetch the user's role from the database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, business_role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      console.log("User role data:", data);
      return data.business_role || data.role || "pemilik";
    } catch (err) {
      console.error("Exception fetching user role:", err);
      return null;
    }
  };

  // Set default user status
  const setDefaultUserStatus = () => {
    setUserStatusId(1); // Default status ID
  };

  return {
    userRole,
    setUserRole,
    userStatusId,
    setUserStatusId,
    fetchUserRole,
    setDefaultUserStatus
  };
};
