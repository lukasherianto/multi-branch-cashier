
import { useEmployeeData } from "./employee/hooks/useEmployeeData";
import { EmployeeFormSection } from "./employee/EmployeeFormSection";
import { EmployeeTable } from "./employee/list/EmployeeTable";
import { useEmployeeForm } from "./employee/useEmployeeForm";
import { EmptyState } from "./employee/list/EmptyState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useEmployeeDelete } from "./employee/useEmployeeDelete";
import { useEmployeePasswordReset } from "./employee/useEmployeePasswordReset";

export function EmployeeForm() {
  const { isLoading, employees, branches, loadEmployees, error } = useEmployeeData();
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Silakan login terlebih dahulu untuk mengelola karyawan.
        </AlertDescription>
      </Alert>
    );
  }
  
  const { form, isLoading: formLoading, onSubmit } = useEmployeeForm(loadEmployees);
  const { deleteEmployee } = useEmployeeDelete(loadEmployees);
  const { resetPassword, isResetting } = useEmployeePasswordReset();

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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Gagal memuat data karyawan: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeFormSection
        form={form}
        branches={branches}
        isLoading={formLoading}
        onSubmit={onSubmit}
      />
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Daftar Karyawan</h2>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState />
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
