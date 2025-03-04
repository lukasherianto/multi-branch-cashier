
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  userStatusId: number | null;
  pelakuUsaha: any;
  cabang: any;
  cabangList: any[];
  selectedCabangId: number | null;
  setSelectedCabangId: (id: number | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userStatusId, setUserStatusId] = useState<number | null>(null);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [cabang, setCabang] = useState<any>(null);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log("Active session found:", session.user.id);
        setUser(session.user);
        
        // Get user role from user metadata
        const role = session.user.user_metadata?.business_role;
        if (role) {
          setUserRole(role as UserRole);
        }
      }
      setIsLoading(false);
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
            .select('status_id')
            .eq('id', session.user.id)
            .single();

          if (!profileError && profileData) {
            setUserStatusId(profileData.status_id);
            console.log("User status_id loaded:", profileData.status_id);
          } else {
            console.error("Error loading user status_id:", profileError);
            setUserStatusId(null);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setUserStatusId(null);
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

          // Sort branches by ID to ensure the first branch (headquarters) is first
          const sortedBranches = (cabangData || []).sort((a, b) => a.cabang_id - b.cabang_id);
          setCabangList(sortedBranches);
          
          // If there's only one branch, select it automatically
          if (sortedBranches.length === 1) {
            setSelectedCabangId(sortedBranches[0].cabang_id);
            setCabang(sortedBranches[0]);
          }
          // If there are multiple branches and none selected, default to Pusat (first/lowest ID branch)
          else if (sortedBranches.length > 1 && !selectedCabangId) {
            // The headquarters is considered the first branch (lowest ID)
            const headquartersId = sortedBranches[0].cabang_id;
            setSelectedCabangId(headquartersId);
            setCabang(sortedBranches[0]);
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
      userRole,
      userStatusId,
      pelakuUsaha, 
      cabang,
      cabangList,
      selectedCabangId,
      setSelectedCabangId,
      isLoading
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
