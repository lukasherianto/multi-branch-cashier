
import { TableCell, TableRow } from "@/components/ui/table";
import { Employee } from "../types";
import { EmployeeActions } from "./EmployeeActions";
import { RoleBadge } from "./RoleBadge";
import { Badge } from "@/components/ui/badge";

interface EmployeeTableRowProps {
  employee: Employee;
  onDelete: (id: number) => Promise<void>;
  onResetPassword: (auth_id: string, newPassword: string) => Promise<boolean>;
}

export const EmployeeTableRow = ({ 
  employee, 
  onDelete, 
  onResetPassword 
}: EmployeeTableRowProps) => {
  return (
    <TableRow className={!employee.isSameBusiness ? "bg-gray-50" : ""}>
      <TableCell className="font-medium">
        {employee.name}
        {!employee.isSameBusiness && (
          <div className="mt-1">
            <Badge variant="outline" className="text-xs">
              {employee.businessName || "Usaha Lain"}
            </Badge>
          </div>
        )}
      </TableCell>
      <TableCell>{employee.email || "-"}</TableCell>
      <TableCell>
        {employee.business_role && (
          <RoleBadge role={employee.business_role} />
        )}
      </TableCell>
      <TableCell>{employee.cabang?.branch_name || "Pusat"}</TableCell>
      <TableCell className="text-right">
        <EmployeeActions 
          employee={employee} 
          onDelete={onDelete} 
          onResetPassword={onResetPassword}
        />
      </TableCell>
    </TableRow>
  );
};
