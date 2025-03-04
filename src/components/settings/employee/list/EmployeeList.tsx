
import { Employee } from "../types";
import { EmptyState } from "./EmptyState";
import { EmployeeTable } from "./EmployeeTable";
import { Loader2 } from "lucide-react";

interface EmployeeListProps {
  employees: Employee[];
  onDelete: (id: number) => Promise<void>;
  onResetPassword: (auth_id: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

export const EmployeeList = ({ 
  employees, 
  onDelete, 
  onResetPassword, 
  isLoading 
}: EmployeeListProps) => {
  if (employees.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        ) : (
          <EmployeeTable 
            employees={employees} 
            onDelete={onDelete} 
            onResetPassword={onResetPassword} 
          />
        )}
      </div>
    </>
  );
};
