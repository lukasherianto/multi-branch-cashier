
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  pelakuUsaha: any;
  cabang: any;
  cabangList: any[];
  selectedCabangId: number | null;
  setSelectedCabangId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [cabang, setCabang] = useState<any>(null);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log("Active session found:", session.user.id);
        setUser(session.user);
      }
    });

    // Set up real-time subscription to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPelakuUsaha(null);
        setCabang(null);
        setCabangList([]);
        setSelectedCabangId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      // Get pelaku usaha data
      const fetchPelakuUsaha = async () => {
        try {
          console.log("Fetching pelaku usaha for user:", user.id);
          
          const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
            .from('pelaku_usaha')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (pelakuUsahaError) {
            console.error('Error mengambil data pelaku usaha:', pelakuUsahaError);
            return;
          }

          if (!pelakuUsahaData) {
            console.log("No pelaku_usaha found for user:", user.id);
            setPelakuUsaha(null);
            setCabangList([]);
            setCabang(null);
            setSelectedCabangId(null);
            return;
          }

          console.log("Data pelaku usaha ditemukan:", pelakuUsahaData);
          setPelakuUsaha(pelakuUsahaData);

          // Get all branches for this pelaku usaha
          const { data: cabangData, error: cabangError } = await supabase
            .from('cabang')
            .select('*')
            .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

          if (cabangError) {
            console.error('Error mengambil data cabang:', cabangError);
            return;
          }

          console.log("Data cabang:", cabangData);
          setCabangList(cabangData || []);
          
          // If there's only one branch, select it automatically
          if (cabangData && cabangData.length === 1) {
            setSelectedCabangId(cabangData[0].cabang_id);
            setCabang(cabangData[0]);
          }
          // If there are multiple branches and none selected, select the first one
          else if (cabangData && cabangData.length > 1 && !selectedCabangId) {
            setSelectedCabangId(cabangData[0].cabang_id);
            setCabang(cabangData[0]);
          }
        } catch (error) {
          console.error('Error in fetchPelakuUsaha:', error);
        }
      };

      fetchPelakuUsaha();
    }
  }, [user, selectedCabangId]);

  useEffect(() => {
    if (selectedCabangId && cabangList.length > 0) {
      const selected = cabangList.find(c => c.cabang_id === selectedCabangId);
      setCabang(selected);
    }
  }, [selectedCabangId, cabangList]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      pelakuUsaha, 
      cabang,
      cabangList,
      selectedCabangId,
      setSelectedCabangId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
