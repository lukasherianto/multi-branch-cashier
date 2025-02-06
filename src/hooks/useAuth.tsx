import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: any;
  pelakuUsaha: any;
  cabang: any;
  cabangList: any[];
  selectedCabangId: number | null;
  setSelectedCabangId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [cabang, setCabang] = useState<any>(null);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedCabangId && cabangList.length > 0) {
      const selected = cabangList.find(c => c.cabang_id === selectedCabangId);
      setCabang(selected);
    }
  }, [selectedCabangId, cabangList]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("User ditemukan:", user?.id);
      
      if (user) {
        setUser(user);
        
        // Get pelaku usaha data
        const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
          .from('pelaku_usaha')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (pelakuUsahaError) {
          console.error('Error mengambil data pelaku usaha:', pelakuUsahaError);
          return;
        }

        console.log("Data pelaku usaha:", pelakuUsahaData);
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

        setCabangList(cabangData);
        
        // If there's only one branch, select it automatically
        if (cabangData.length === 1) {
          setSelectedCabangId(cabangData[0].cabang_id);
          setCabang(cabangData[0]);
        }
        // If there are multiple branches and none selected, select the first one
        else if (cabangData.length > 1 && !selectedCabangId) {
          setSelectedCabangId(cabangData[0].cabang_id);
          setCabang(cabangData[0]);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

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