
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useEmployeeDelete = (loadEmployees: () => Promise<void>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const deleteEmployee = async (authId: string) => {
    try {
      setIsLoading(true);
      console.log("Deactivating employee with auth ID:", authId);
      
      // Update profile to mark employee as inactive
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_employee: false })
        .eq("id", authId);

      if (updateError) throw updateError;

      // Deactivate Supabase auth account
      const { error: authError } = await supabase.auth.admin.updateUserById(
        authId,
        { user_metadata: { is_active: false } }
      );
      if (authError) throw authError;

      toast({
        title: "Sukses",
        description: "Karyawan berhasil dihapus",
      });

      loadEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus karyawan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteEmployee,
    isDeleting: isLoading
  };
};
