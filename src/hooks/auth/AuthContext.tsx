
import { createContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from "./types";

// Create context with default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<string | null>('pelaku_usaha');
  const [userStatusId, setUserStatusId] = useState<number | null>(1);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Set up listener for auth state change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setUserRole(null);
        setUserStatusId(null);
        setPelakuUsaha(null);
        setCabang(null);
        setCabangList([]);
        setSelectedCabangId(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to fetch user data and business data
  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching user data for ID:", userId);

      // For simplicity, set default role to 'pelaku_usaha'
      setUserRole('pelaku_usaha');
      setUserStatusId(1); // Status ID for pelaku_usaha

      // Get pelaku_usaha data
      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error("Error fetching pelaku usaha:", pelakuUsahaError);
      } else if (pelakuUsahaData) {
        console.log("Found pelaku usaha:", pelakuUsahaData);
        setPelakuUsaha(pelakuUsahaData);
        
        // Get branches data
        const { data: cabangData, error: cabangError } = await supabase
          .from('cabang')
          .select('*')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
          .order('cabang_id', { ascending: true });

        if (cabangError) {
          console.error("Error fetching cabang:", cabangError);
        } else if (cabangData && cabangData.length > 0) {
          console.log("Found cabang:", cabangData);
          setCabangList(cabangData);
          
          // Find the main branch (HQ) or use the first branch
          const mainCabang = cabangData.find(c => c.status === 1) || cabangData[0];
          setCabang(mainCabang);
          setSelectedCabangId(mainCabang.cabang_id);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Values to share through context
  const value: AuthContextType = {
    user,
    userRole,
    userStatusId,
    pelakuUsaha,
    cabang,
    cabangList,
    selectedCabangId,
    selectedBranchId: selectedCabangId, // Alias for selectedCabangId
    setSelectedCabangId,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
