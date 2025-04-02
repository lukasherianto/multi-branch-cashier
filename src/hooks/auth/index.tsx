
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthContextType } from "./types";

// Create context for the auth state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);
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

  // Function to fetch user's business data
  const fetchBusinessData = async (userId: string) => {
    try {
      console.log("Fetching business data for user ID:", userId);
      
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
      console.error("Error in fetchBusinessData:", error);
    }
  };

  // Check for the initial session when the component mounts
  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setUser(null);
          setUserRole(null);
        } else if (data.session) {
          setUser(data.session.user);
          const role = await fetchUserRole(data.session.user.id);
          setUserRole(role);
          setUserStatusId(1); // Default status ID
          await fetchBusinessData(data.session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Unexpected error in auth check:", error);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (session) {
          setUser(session.user);
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          setUserStatusId(1); // Default status ID
          await fetchBusinessData(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
          setPelakuUsaha(null);
          setCabang(null);
          setCabangList([]);
          setSelectedCabangId(null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Login berhasil!");
      return data;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Login gagal: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setPelakuUsaha(null);
      setCabang(null);
      setCabangList([]);
      setSelectedCabangId(null);
      toast.success("Logout berhasil");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(`Logout gagal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password function
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set new password function
  const setNewPassword = async (password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error("Set new password error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Provide the auth context to the app
  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      userStatusId,
      pelakuUsaha,
      cabang,
      cabangList,
      selectedCabangId,
      selectedBranchId: selectedCabangId, // Alias for selectedCabangId
      setSelectedCabangId,
      isLoading,
      signIn,
      signOut,
      resetPassword,
      setNewPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
