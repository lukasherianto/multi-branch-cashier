
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./types";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userStatusId, setUserStatusId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Maksimal waktu untuk loading
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 detik timeout

    // Check active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        console.log("Active session found:", session.user.id);
        setUser(session.user);
        
        // Get user role from user metadata
        const role = session.user.user_metadata?.business_role;
        if (role) {
          setUserRole(role as UserRole);
        }

        // Langsung ambil status_id dari profiles
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('status_id, business_role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profileError && profileData) {
            setUserStatusId(profileData.status_id);
            console.log("User status_id loaded:", profileData.status_id);
            
            // Jika business_role tidak ada di metadata, gunakan dari profiles
            if (!role && profileData.business_role) {
              setUserRole(profileData.business_role as UserRole);
              console.log("User role loaded from profiles:", profileData.business_role);
            }
          } else {
            console.error("Error loading user profile:", profileError);
          }
        } catch (error) {
          console.error("Error in profile fetch:", error);
        }
      }
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    });

    // Set up real-time subscription to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        
        // Get user role from user metadata
        const role = session?.user?.user_metadata?.business_role;
        if (role) {
          setUserRole(role as UserRole);
        }

        // Get user status_id from profiles table
        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('status_id, business_role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profileError && profileData) {
            setUserStatusId(profileData.status_id);
            console.log("User status_id loaded:", profileData.status_id);
            
            // Jika business_role tidak ada di metadata, gunakan dari profiles
            if (!role && profileData.business_role) {
              setUserRole(profileData.business_role as UserRole);
              console.log("User role loaded from profiles:", profileData.business_role);
            }
          } else {
            console.error("Error loading user status_id:", profileError);
            setUserStatusId(null);
          }
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setUserStatusId(null);
        setIsLoading(false);
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  return { user, userRole, userStatusId, isLoading, setUser, setUserRole, setUserStatusId };
};
