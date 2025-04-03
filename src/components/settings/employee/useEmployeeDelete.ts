
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

      if (getError) {
        console.error("Error getting employee:", getError);
        throw getError;
      }

      if (!employee?.auth_id) {
        throw new Error("Employee auth_id not found");
      }

      // Delete from karyawan table (this will cascade to profiles due to FK constraint)
      const { error: deleteError } = await supabase
        .from("karyawan")
        .delete()
        .eq("karyawan_id", karyawanId);

      if (deleteError) {
        console.error("Error deleting employee:", deleteError);
        throw deleteError;
      }

      // Update user profile to mark as not an employee
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ 
          is_employee: false,
          business_role: null
        })
        .eq("id", employee.auth_id);

      if (updateProfileError) {
        console.error("Error updating profile:", updateProfileError);
        // This is not critical, so we don't throw an error
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
