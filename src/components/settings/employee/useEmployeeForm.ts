
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeFormData } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema } from "./schema";
import { mapRoleToStatusId } from "./utils/roleMapper";
import { 
  getPelakuUsahaId, 
  validateBranchId, 
  createAuthAccount, 
  updateProfileStatus, 
  createEmployeeRecord 
} from "./services/employeeService";

export const useEmployeeForm = (loadEmployees: () => Promise<void>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp_contact: "",
      role: "",
      business_role: "",
      cabang_id: "",
      password: "",
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsLoading(true);
      console.log("Submitting employee data:", data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Anda harus login terlebih dahulu",
          variant: "destructive",
        });
        return;
      }

      // Get pelaku usaha ID
      const pelakuUsahaId = await getPelakuUsahaId(user.id);

      // Get status ID for the role
      const statusId = mapRoleToStatusId(data.business_role);

      // Parse and validate cabang ID
      let cabangId: number | null = null;
      if (data.cabang_id && data.cabang_id !== "0") {
        const parsedCabangId = parseInt(data.cabang_id, 10);
        if (!isNaN(parsedCabangId)) {
          cabangId = parsedCabangId;
          await validateBranchId(cabangId);
        } else {
          console.error("Invalid cabang_id format:", data.cabang_id);
          toast({
            title: "Error",
            description: "Format ID cabang tidak valid",
            variant: "destructive",
          });
          return;
        }
      }

      // Create auth account
      const authUser = await createAuthAccount(data);
      
      // Update profile status
      await updateProfileStatus(authUser.id, statusId);

      // Insert employee data
      // Use business_role as role since the karyawan table only has a role column
      const employeeData = {
        name: data.name,
        email: data.email,
        whatsapp_contact: data.whatsapp_contact || null,
        role: data.business_role, // Use business_role since role column exists but business_role doesn't
        cabang_id: cabangId,
        pelaku_usaha_id: pelakuUsahaId,
        auth_id: authUser.id,
        is_active: true
      };

      console.log("Inserting employee data:", employeeData);

      await createEmployeeRecord(employeeData);

      console.log("Employee successfully inserted");

      toast({
        title: "Sukses",
        description: "Karyawan berhasil ditambahkan",
      });

      form.reset();
      await loadEmployees();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan karyawan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit
  };
};
