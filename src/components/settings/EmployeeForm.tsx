
import { Users, UserPlus } from "lucide-react";
import { EmployeeList } from "./employee/list";
import { useEmployeeData } from "./employee/hooks/useEmployeeData";
import { useEmployeeForm } from "./employee/useEmployeeForm";
import { useEmployeeDelete } from "./employee/useEmployeeDelete";
import { EmployeeFormSection } from "./employee/EmployeeFormSection";
import { useEmployeePasswordReset } from "./employee/useEmployeePasswordReset";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";

export function EmployeeForm() {
  const { isLoading: dataLoading, employees, branches, loadEmployees, error: dataError } = useEmployeeData();
  const { form, isLoading: formLoading, onSubmit } = useEmployeeForm(loadEmployees);
  const { deleteEmployee, isDeleting } = useEmployeeDelete(loadEmployees);
  const { resetPassword, isResetting } = useEmployeePasswordReset();

  const isLoading = dataLoading || formLoading || isDeleting || isResetting;

  // Reset form when data is loaded
  useEffect(() => {
    if (!dataLoading && form) {
      form.reset({
        name: "",
        email: "",
        whatsapp_contact: "",
        role: "",
        business_role: "",
        cabang_id: "",
        password: "",
      });
    }
  }, [dataLoading, form]);

  if (dataError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>
          {dataError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeFormSection 
        form={form}
        branches={branches}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-medium">Daftar Karyawan</h3>
        </div>
        <EmployeeList 
          employees={employees}
          onDelete={deleteEmployee}
          onResetPassword={resetPassword}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
