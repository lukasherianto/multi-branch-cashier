
import { Employee } from "../types";
import { EmptyState } from "./EmptyState";

interface EmployeeListProps {
  employees: Employee[];
  onDelete: (id: string) => Promise<void>;
  onResetPassword: (auth_id: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

export const EmployeeList = ({ 
  employees, 
  onDelete, 
  onResetPassword, 
  isLoading 
}: EmployeeListProps) => {
  return (
    <div className="border rounded-md p-8 text-center">
      <p className="text-muted-foreground">
        Fitur karyawan telah dinonaktifkan. Aplikasi ini hanya untuk pengguna pemilik usaha.
      </p>
    </div>
  );
};
