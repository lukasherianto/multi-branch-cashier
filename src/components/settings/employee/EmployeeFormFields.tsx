
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Branch, EmployeeFormData } from "./types";

interface EmployeeFormFieldsProps {
  form: UseFormReturn<EmployeeFormData>;
  branches: Branch[];
}

export const EmployeeFormFields = ({ form, branches }: EmployeeFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama <span className="text-red-500">*</span></FormLabel>
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
            <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input type="email" placeholder="Email karyawan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="Password untuk login" 
                {...field} 
              />
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
        name="business_role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jabatan <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="pelaku_usaha">Pelaku Usaha</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="kasir">Kasir</SelectItem>
                <SelectItem value="pelayan">Pelayan</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deskripsi Jabatan</FormLabel>
            <FormControl>
              <Input placeholder="Deskripsi jabatan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cabang_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cabang <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0">Pusat</SelectItem>
                {branches.map((branch) => (
                  <SelectItem
                    key={branch.cabang_id}
                    value={branch.cabang_id.toString()}
                  >
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
