
import { useState } from "react";
import { supabase, getEdgeFunctionUrl } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";

export const useEmployeePasswordReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const { userRole } = useAuth();

  const resetPassword = async (auth_id: string, newPassword: string) => {
    try {
      setIsResetting(true);
      
      // Check if user has permission to reset passwords
      if (userRole !== 'pelaku_usaha' && userRole !== 'admin') {
        toast({
          title: "Error",
          description: "Anda tidak memiliki izin untuk mengubah password karyawan",
          variant: "destructive",
        });
        return false;
      }
      
      // Get the session for the current user to pass along the JWT
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Anda harus login terlebih dahulu",
          variant: "destructive",
        });
        return false;
      }
      
      // Call our Edge Function to reset the password
      const functionUrl = getEdgeFunctionUrl('reset-employee-password');
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          auth_id,
          new_password: newPassword
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengubah password');
      }

      toast({
        title: "Sukses",
        description: "Password karyawan berhasil diubah",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error in resetPassword:", error);
      
      toast({
        title: "Error",
        description: error.message || "Gagal mengubah password karyawan",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetPassword,
    isResetting
  };
};
