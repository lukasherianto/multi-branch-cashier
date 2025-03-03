
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { Branch, EmployeeFormData } from "./types";
import { UseFormReturn } from "react-hook-form";

interface EmployeeFormSectionProps {
  form: UseFormReturn<EmployeeFormData>;
  branches: Branch[];
  isLoading: boolean;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
}

export const EmployeeFormSection = ({ 
  form, 
  branches, 
  isLoading, 
  onSubmit 
}: EmployeeFormSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Tambah Karyawan</h3>
      <p className="text-sm text-muted-foreground">
        Tambahkan data karyawan baru untuk usaha Anda
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
    </div>
  );
};
