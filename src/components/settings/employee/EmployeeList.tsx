import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Employee } from "./types";
import { Badge } from "@/components/ui/badge";

interface EmployeeListProps {
  employees: Employee[];
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const EmployeeList = ({ employees, onDelete, isLoading }: EmployeeListProps) => {
  // Separate employees into two groups
  const currentBusinessEmployees = employees.filter(emp => emp.isSameBusiness);
  const otherBusinessEmployees = employees.filter(emp => !emp.isSameBusiness);

  return (
    <div className="space-y-6">
      {/* Current Business Employees */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Karyawan Usaha Anda</h4>
        <div className="space-y-4">
          {currentBusinessEmployees.map((employee) => (
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
          {currentBusinessEmployees.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada karyawan terdaftar
            </p>
          )}
        </div>
      </div>

      {/* Other Business Employees */}
      {otherBusinessEmployees.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">Karyawan Usaha Lain</h4>
          <div className="space-y-4">
            {otherBusinessEmployees.map((employee) => (
              <div
                key={employee.karyawan_id}
                className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.role}</p>
                  {employee.email && (
                    <p className="text-sm text-muted-foreground">
                      {employee.email}
                    </p>
                  )}
                  <Badge variant="secondary" className="mt-1">
                    {employee.businessName}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
