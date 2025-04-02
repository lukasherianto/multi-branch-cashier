
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      toast.loading("Sedang keluar...");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("Gagal keluar: " + error.message);
        return false;
      }
      
      // Redirect to auth page with full page refresh to clear all state
      window.location.href = "/auth";
      return true;
    } catch (error) {
      console.error("Unexpected logout error:", error);
      toast.error("Gagal keluar, terjadi kesalahan");
      return false;
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    logout,
    isLoggingOut
  };
};
