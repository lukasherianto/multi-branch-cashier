
import { useEffect } from "react";
import { useEmployeeData } from "./employee/hooks/useEmployeeData";
import { useEmployeeForm } from "./employee/useEmployeeForm";
import { EmployeeFormSection } from "./employee/EmployeeFormSection";
import { EmployeeTable } from "./employee/list/EmployeeTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useEmployeeDelete } from "./employee/useEmployeeDelete";
import { useEmployeePasswordReset } from "./employee/useEmployeePasswordReset";

export function EmployeeForm() {
  const { isLoading, employees, branches, loadEmployees, error } = useEmployeeData();
  const { userRole } = useAuth();
  const isCashier = userRole === 'kasir';
  
  // If user is a cashier, don't show employee management
  if (isCashier) {
    return (
      <Alert variant="default" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Anda tidak memiliki akses untuk manajemen karyawan.
        </AlertDescription>
      </Alert>
    );
  }
  
  const { form, isLoading: formLoading, onSubmit } = useEmployeeForm(loadEmployees);
  const { deleteEmployee } = useEmployeeDelete(loadEmployees);
  const { resetPassword } = useEmployeePasswordReset();

  // Handler for employee deletion
  const handleEmployeeDelete = async (authId: string) => {
    await deleteEmployee(authId);
    await loadEmployees();
  };

  // Handler for password reset
  const handlePasswordReset = async (authId: string, newPassword: string) => {
    return await resetPassword(authId, newPassword);
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <EmployeeFormSection 
        form={form} 
        branches={branches} 
        isLoading={formLoading} 
        onSubmit={onSubmit} 
      />
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Daftar Karyawan</h3>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <EmployeeTable 
            employees={employees} 
            onEmployeeDeleted={handleEmployeeDelete}
            onPasswordReset={handlePasswordReset}
          />
        )}
      </div>
    </div>
  );
}
