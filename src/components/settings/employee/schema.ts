
import * as z from "zod";

// Create a schema for employee data validation
export const employeeSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  whatsapp_contact: z.string().optional(),
  role: z.string().optional(),
  business_role: z.string().min(1, "Jabatan wajib diisi"),
  cabang_id: z.string().min(1, "Cabang wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
