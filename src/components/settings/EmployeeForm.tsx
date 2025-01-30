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
      
      const { data: pelakuUsaha } = await supabase
        .from("pelaku_usaha")
        .select("pelaku_usaha_id")
        .single();

      if (!pelakuUsaha) {
        toast({
          title: "Error",
          description: "Data usaha tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      // Create auth user for employee
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password || '',
        options: {
          data: {
            name: data.name,
            role: 'employee'
          }
        }
      });

      if (authError) throw authError;

      // Create employee record
      const { error: employeeError } = await supabase.from("karyawan").insert({
        ...data,
        auth_id: authData.user?.id,
        cabang_id: data.cabang_id ? parseInt(data.cabang_id) : null,
        pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
      });

      if (employeeError) throw employeeError;

      toast({
        title: "Sukses",
        description: "Karyawan berhasil ditambahkan",
      });

      form.reset();
      loadEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan karyawan",
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
      const { error } = await supabase
        .from("karyawan")
        .delete()
        .eq("karyawan_id", karyawanId);

      if (error) throw error;

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