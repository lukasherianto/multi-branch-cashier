
import { Users } from "lucide-react";
import { EmployeeList } from "./employee/EmployeeList";
import { useEmployeeData } from "./employee/hooks/useEmployeeData";
import { useEmployeeForm } from "./employee/useEmployeeForm";
import { useEmployeeDelete } from "./employee/useEmployeeDelete";
import { EmployeeFormSection } from "./employee/EmployeeFormSection";
import { useEffect } from "react";

export function EmployeeForm() {
  const { isLoading: dataLoading, employees, branches, loadEmployees } = useEmployeeData();
  const { form, isLoading: formLoading, onSubmit } = useEmployeeForm(loadEmployees);
  const { deleteEmployee, isDeleting } = useEmployeeDelete(loadEmployees);

  const isLoading = dataLoading || formLoading || isDeleting;

  // Memuat ulang data karyawan saat komponen dimount
  useEffect(() => {
    console.log("EmployeeForm mounted, loading employees...");
    loadEmployees();
  }, []);

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
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
