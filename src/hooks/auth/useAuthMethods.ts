
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthMethods = () => {
  const [isLoading, setIsLoading] = useState(false);

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

  return {
    isLoading,
    setIsLoading,
    signIn,
    signOut,
    resetPassword,
    setNewPassword
  };
};
