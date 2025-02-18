
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UserPlus, Loader2, Users } from "lucide-react";
import { EmployeeFormFields } from "./employee/EmployeeFormFields";
import { EmployeeList } from "./employee/EmployeeList";
import { useEmployeeData } from "./employee/useEmployeeData";
import { EmployeeFormData } from "./employee/types";

export function EmployeeForm() {
  const { toast } = useToast();
  const { isLoading, setIsLoading, employees, branches, loadEmployees } = useEmployeeData();

  const form = useForm<EmployeeFormData>({
    defaultValues: {
      name: "",
      email: "",
      whatsapp_contact: "",
      role: "",
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

      // Create Supabase auth account for employee
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            whatsapp_number: data.whatsapp_contact,
            is_employee: true,
            business_role: data.role
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
          role: data.role,
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Tambah Karyawan</h3>
        <p className="text-sm text-muted-foreground">
          Tambahkan data karyawan baru untuk usaha Anda
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <EmployeeFormFields form={form} branches={branches} />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Tambah Karyawan
          </Button>
        </form>
      </Form>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-medium">Daftar Karyawan</h3>
        </div>
        <EmployeeList 
          employees={employees}
          onDelete={deleteEmployee}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
