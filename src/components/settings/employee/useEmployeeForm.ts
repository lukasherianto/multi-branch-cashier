
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
import { fetchUserPelakuUsaha } from "./api/businessQueries";

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

      // Fetch business owner's data
      const businessData = await fetchUserPelakuUsaha(user.id);
      
      if (!businessData) {
        toast({
          title: "Error",
          description: "Data usaha tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      // Override some employee data with business owner's data
      const employeeDataWithBusinessInfo = {
        ...data,
        name: businessData.business_name || data.name,
        whatsapp_contact: businessData.contact_whatsapp || data.whatsapp_contact,
      };

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
        ...employeeDataWithBusinessInfo,
        cabang_id: cabangId ? cabangId.toString() : "0"
      });
      
      // Update profile role and business_role
      await updateProfileStatus(authUser.id, data.business_role);

      // Update the profile with cabang_id and business info
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          cabang_id: cabangId,
          pelaku_usaha_id: pelakuUsahaId,
          business_role: data.business_role,
          whatsapp_number: employeeDataWithBusinessInfo.whatsapp_contact,
          full_name: employeeDataWithBusinessInfo.name
        })
        .eq('id', authUser.id);
        
      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError);
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
