
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeFormData } from "./types";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Create a schema for employee data validation
const employeeSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  whatsapp_contact: z.string().optional(),
  role: z.string().optional(),
  business_role: z.string().min(1, "Jabatan wajib diisi"),
  cabang_id: z.string().min(1, "Cabang wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

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
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to create employee account");
      }

      // Update the status_id in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status_id: statusId })
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
        .from("karyawan")
        .insert({
          name: data.name,
          email: data.email,
          whatsapp_contact: data.whatsapp_contact,
          role: data.role || data.business_role, // Use business_role as fallback if role is not provided
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
        throw new Error(employeeError.message);
      }

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
