
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeFormData } from "./types";

export const useEmployeeForm = (loadEmployees: () => Promise<void>) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmployeeFormData>({
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

      const { data: pelakuUsaha } = await supabase
        .from("pelaku_usaha")
        .select("pelaku_usaha_id")
        .eq("user_id", user.id)
        .single();

      if (!pelakuUsaha) {
        toast({
          title: "Error",
          description: "Data usaha tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      // Map business_role to the appropriate user_status ID
      let statusId: number;
      
      switch (data.business_role) {
        case 'pelaku_usaha':
          statusId = 1;
          break;
        case 'admin':
          statusId = 2;
          break;
        case 'kasir':
          statusId = 3;
          break;
        case 'pelayan':
          statusId = 4;
          break;
        default:
          statusId = 3; // Default to 'kasir' if unknown role
      }

      // Create Supabase auth account for employee
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            whatsapp_number: data.whatsapp_contact,
            is_employee: true,
            business_role: data.business_role,
            status_id: statusId
          }
        }
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create employee account");
      }

      // Update the status_id in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          status_id: statusId,
          business_role: data.business_role
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Error updating profile status_id:", profileError);
      }

      // Verify if the selected branch exists (if one was selected)
      if (data.cabang_id && data.cabang_id !== "0") {
        const { data: branchData, error: branchError } = await supabase
          .from("cabang")
          .select("cabang_id")
          .eq("cabang_id", parseInt(data.cabang_id))
          .single();

        if (branchError || !branchData) {
          toast({
            title: "Error",
            description: "Cabang yang dipilih tidak valid",
            variant: "destructive",
          });
          return;
        }
      }

      // Insert employee data
      const { data: employeeData, error: employeeError } = await supabase
        .from("karyawan" as any)
        .insert({
          name: data.name,
          email: data.email,
          whatsapp_contact: data.whatsapp_contact,
          role: data.role,
          business_role: data.business_role,
          cabang_id: data.cabang_id === "0" ? null : parseInt(data.cabang_id),
          pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
          auth_id: authData.user.id,
          is_active: true
        })
        .select()
        .single();

      if (employeeError) {
        console.error("Employee insert error:", employeeError);
        throw employeeError;
      }

      toast({
        title: "Sukses",
        description: "Karyawan berhasil ditambahkan",
      });

      form.reset();
      loadEmployees();
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
