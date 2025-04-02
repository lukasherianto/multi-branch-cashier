
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useEmployeeDelete = (loadEmployees: () => Promise<void>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const deleteEmployee = async (karyawanId: number) => {
    try {
      setIsLoading(true);
      console.log("Deleting employee:", karyawanId);
      
      // Get employee data first to get auth_id
      const { data: employee, error: getError } = await supabase
        .from("karyawan")
        .select("auth_id")
        .eq("karyawan_id", karyawanId)
        .single();

      if (getError) throw getError;

      // Delete from karyawan table
      const { error: deleteError } = await supabase
        .from("karyawan")
        .delete()
        .eq("karyawan_id", karyawanId);

      if (deleteError) throw deleteError;

      // Deactivate Supabase auth account
      if (employee?.auth_id) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          employee.auth_id,
          { user_metadata: { is_active: false } }
        );
        if (authError) throw authError;
      }

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
