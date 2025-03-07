
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "../use-toast";

export const useAuthState = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [userStatusId, setUserStatusId] = useState<number | null>(null);
  const [userBranch, setUserBranch] = useState<any>(null);
  const [userBranchId, setUserBranchId] = useState<number | null>(null);

  useEffect(() => {
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Initial session
    getSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getSession = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      // If user exists, get profile and role
      if (session?.user) {
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            whatsapp_number,
            role,
            pelaku_usaha_id,
            cabang_id,
            cabang (
              cabang_id,
              branch_name,
              address,
              contact_whatsapp
            )
          `)
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          // Set role directly from profile
          if (profileData.role) {
            setUserRole(profileData.role);
            
            // Get status_id from user_status table using role
            const { data: statusData } = await supabase
              .from('user_status')
              .select('status_id')
              .eq('wewenang', profileData.role)
              .maybeSingle();
              
            if (statusData) {
              setUserStatusId(statusData.status_id);
            }
          }
          
          // Set user branch data
          if (profileData.cabang_id && profileData.cabang) {
            setUserBranch(profileData.cabang);
            setUserBranchId(profileData.cabang_id);
          }
        }
      }
    } catch (error) {
      console.error("Error getting session:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to get user session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    user,
    isLoading,
    userRole,
    userBranch,
    userBranchId,
    userStatusId,
    refreshSession: getSession
  };
};
