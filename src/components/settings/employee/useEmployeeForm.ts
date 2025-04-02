
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeFormData } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema } from "./schema";
import { 
  getPelakuUsahaId, 
  validateBranchId, 
  createAuthAccount, 
  updateProfileStatus
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

      // Create auth account with cabang_id in user metadata
      const authUser = await createAuthAccount({
        ...data,
        cabang_id: cabangId ? cabangId.toString() : "0" // Pass the cabang_id to be stored in user metadata
      });
      
      // Update profile role and business_role
      await updateProfileStatus(authUser.id, data.business_role);

      // Update the profile with cabang_id
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          cabang_id: cabangId,
          pelaku_usaha_id: pelakuUsahaId,  // Ensure pelaku_usaha_id is also set in the profile
          business_role: data.business_role, // Explicitly set business_role
          whatsapp_number: data.whatsapp_contact // Add missing fields but don't include email as it doesn't exist in profiles
        })
        .eq('id', authUser.id);
        
      if (profileUpdateError) {
        console.error("Error updating profile cabang_id:", profileUpdateError);
        // Continue even if profile update fails
      }

      console.log("Employee successfully created with profile data");

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
