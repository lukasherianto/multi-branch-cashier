
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Create context for the auth state
interface AuthContextType {
  user: any | null;
  userRole: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  setNewPassword: (password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        } else {
          setUser(null);
          setUserRole(null);
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
