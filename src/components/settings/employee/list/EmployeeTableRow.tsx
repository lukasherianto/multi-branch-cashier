
import { TableCell, TableRow } from "@/components/ui/table";
import { Employee } from "../types";
import { Badge } from "@/components/ui/badge";
import { EmployeeActions } from "./EmployeeActions";

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
  const getBadgeColor = (role: string) => {
    switch (role) {
      case "pelaku_usaha":
        return "bg-red-500 hover:bg-red-600";
      case "admin":
        return "bg-blue-500 hover:bg-blue-600";
      case "kasir":
        return "bg-green-500 hover:bg-green-600";
      case "pelayan":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{employee.name}</TableCell>
      <TableCell>{employee.email || "-"}</TableCell>
      <TableCell>
        {employee.business_role && (
          <Badge className={getBadgeColor(employee.business_role)}>
            {employee.business_role === "pelaku_usaha"
              ? "Pelaku Usaha"
              : employee.business_role === "admin"
              ? "Admin"
              : employee.business_role === "kasir"
              ? "Kasir"
              : employee.business_role === "pelayan"
              ? "Pelayan"
              : employee.business_role}
          </Badge>
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
