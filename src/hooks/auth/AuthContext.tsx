
import { createContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from "./types";
import { useBusinessData } from "./useBusinessData";
import { useUserRole } from "./useUserRole";
import { useAuthMethods } from "./useAuthMethods";

// Create context with default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any | null>(null);
  
  // Use our custom hooks
  const { 
    userRole, setUserRole, userStatusId, setUserStatusId, 
    fetchUserRole, setDefaultUserStatus 
  } = useUserRole();
  
  const {
    pelakuUsaha, cabang, cabangList, selectedCabangId,
    setSelectedCabangId, fetchBusinessData
  } = useBusinessData();
  
  const {
    isLoading, setIsLoading, signIn, signOut, resetPassword, setNewPassword
  } = useAuthMethods();

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
          setDefaultUserStatus(); // Set default status ID
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
          setDefaultUserStatus(); // Set default status ID
          await fetchBusinessData(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
          // Reset business data
          setSelectedCabangId(null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
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
