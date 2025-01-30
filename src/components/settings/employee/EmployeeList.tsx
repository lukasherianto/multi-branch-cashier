import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Employee } from "./types";

interface EmployeeListProps {
  employees: Employee[];
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const EmployeeList = ({ employees, onDelete, isLoading }: EmployeeListProps) => {
  return (
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
            <p className="text-sm text-muted-foreground">
              {employee.cabang?.branch_name || "Pusat"}
            </p>
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(employee.karyawan_id)}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};