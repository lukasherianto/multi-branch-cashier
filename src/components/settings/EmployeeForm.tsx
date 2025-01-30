import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserPlus, Loader2, Trash2, Users } from "lucide-react";

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp_contact: string;
  role: string;
}

export function EmployeeForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  const form = useForm<EmployeeFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      whatsapp_contact: "",
      role: "",
    },
  });

  const loadEmployees = async () => {
    try {
      const { data: pelakuUsaha } = await supabase
        .from("pelaku_usaha")
        .select("pelaku_usaha_id")
        .single();

      if (!pelakuUsaha) {
        console.error("No pelaku usaha found");
        return;
      }

      const { data: employeesData, error } = await supabase
        .from("karyawan")
        .select("*")
        .eq("pelaku_usaha_id", pelakuUsaha.pelaku_usaha_id);

      if (error) throw error;
      setEmployees(employeesData || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data karyawan",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsLoading(true);
      
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

      const { error } = await supabase.from("karyawan").insert({
        ...data,
        pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
      });

      if (error) throw error;

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

  // Load employees when component mounts
  useState(() => {
    loadEmployees();
  });

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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Nama karyawan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email karyawan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input placeholder="Nomor telepon" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp_contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="Nomor WhatsApp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jabatan</FormLabel>
                <FormControl>
                  <Input placeholder="Jabatan karyawan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
        <div className="space-y-4">
          {employees.map((employee) => (
            <div
              key={employee.karyawan_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.role}</p>
                {employee.email && (
                  <p className="text-sm text-muted-foreground">
                    {employee.email}
                  </p>
                )}
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteEmployee(employee.karyawan_id)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}