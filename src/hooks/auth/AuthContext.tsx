
import { createContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from "./types";

// Buat context dengan nilai default undefined
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userStatusId, setUserStatusId] = useState<number | null>(null);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil session pengguna saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Set up listener untuk perubahan auth state
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

  // Fungsi untuk mengambil data user, pelaku usaha, dan cabang
  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching user data for ID:", userId);

      // 1. Ambil profile (jika ada)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          cabang (
            cabang_id,
            branch_name,
            address,
            contact_whatsapp
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profileData) {
        // Get user role directly from the profile
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
        
        // If profile has a cabang_id and cabang data, use it
        if (profileData.cabang_id && profileData.cabang) {
          setCabang(profileData.cabang);
          setSelectedCabangId(profileData.cabang_id);
        }
      }

      // 2. Ambil data pelaku usaha (jika user adalah pelaku usaha)
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
        
        // 3. Jika pelaku usaha ditemukan, ambil data cabang
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
          
          // Only set default cabang if not already set from profile
          if (!selectedCabangId) {
            // Pilih cabang pertama sebagai default
            const defaultCabang = cabangData[0];
            setCabang(defaultCabang);
            setSelectedCabangId(defaultCabang.cabang_id);
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Nilai yang akan dishare melalui context
  const value: AuthContextType = {
    user,
    userRole,
    userStatusId,
    pelakuUsaha,
    cabang,
    cabangList,
    selectedCabangId,
    selectedBranchId: selectedCabangId, // Make selectedBranchId an alias for selectedCabangId
    setSelectedCabangId,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
