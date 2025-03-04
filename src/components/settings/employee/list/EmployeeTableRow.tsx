
import { TableCell, TableRow } from "@/components/ui/table";
import { Employee } from "../types";
import { EmployeeActions } from "./EmployeeActions";
import { RoleBadge } from "./RoleBadge";

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
    <TableRow>
      <TableCell className="font-medium">{employee.name}</TableCell>
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
