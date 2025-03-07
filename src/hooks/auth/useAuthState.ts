
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userStatusId, setUserStatusId] = useState<number | null>(null);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!sessionData.session) {
          // No active session
          setUser(null);
          setLoading(false);
          return;
        }

        // Set user from session
        setUser(sessionData.session.user);

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            whatsapp_number,
            status_id,
            pelaku_usaha_id,
            cabang_id,
            cabang (
              branch_name,
              address,
              contact_whatsapp
            )
          `)
          .eq('id', sessionData.session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          // Set status ID from profile
          setUserStatusId(profileData.status_id);
          
          // Get user role from status_id using user_status table
          if (profileData.status_id) {
            const { data: statusData } = await supabase
              .from('user_status')
              .select('wewenang')
              .eq('status_id', profileData.status_id)
              .maybeSingle();
              
            if (statusData) {
              setUserRole(statusData.wewenang);
            }
          }
          
          // Set cabang data if exists
          if (profileData.cabang_id && profileData.cabang) {
            setCabang(profileData.cabang);
            setSelectedCabangId(profileData.cabang_id);
          }
        }

        // Get pelaku usaha data
        const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
          .from('pelaku_usaha')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle();

        if (pelakuUsahaError) {
          console.error("Error fetching pelaku usaha:", pelakuUsahaError);
        } else if (pelakuUsahaData) {
          setPelakuUsaha(pelakuUsahaData);

          // Get branch data for this pelaku_usaha
          const { data: branchData, error: branchError } = await supabase
            .from('cabang')
            .select('*')
            .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

          if (branchError) {
            console.error("Error fetching branches:", branchError);
          } else if (branchData && branchData.length > 0) {
            setCabangList(branchData);
            
            // If cabang wasn't set from profile, use the first branch as default
            if (!selectedCabangId) {
              setCabang(branchData[0]);
              setSelectedCabangId(branchData[0].cabang_id);
            }
          }
        }
      } catch (error) {
        console.error("Error in useAuthState:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchData();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRole(null);
          setUserStatusId(null);
          setPelakuUsaha(null);
          setCabang(null);
          setCabangList([]);
          setSelectedCabangId(null);
        }
      }
    );

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    userRole,
    userStatusId,
    pelakuUsaha,
    cabang,
    cabangList,
    selectedCabangId,
    setSelectedCabangId,
    loading
  };
};
