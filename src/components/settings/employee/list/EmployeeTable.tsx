
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Employee } from "../types";
import { EmployeeTableRow } from "./EmployeeTableRow";

interface EmployeeTableProps {
  employees: Employee[];
  onDelete: (id: string) => Promise<void>; // Updated to use string instead of number
  onResetPassword: (auth_id: string, newPassword: string) => Promise<boolean>;
}

export const EmployeeTable = ({ 
  employees, 
  onDelete, 
  onResetPassword 
}: EmployeeTableProps) => {
  // Sort employees - first show employees from current business, then others
  const sortedEmployees = [...employees].sort((a, b) => {
    // First sort by isSameBusiness (true first)
    if (a.isSameBusiness === b.isSameBusiness) {
      // Then sort by name alphabetically
      return a.name.localeCompare(b.name);
    }
    return a.isSameBusiness ? -1 : 1;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>WhatsApp</TableHead>
          <TableHead>Jabatan</TableHead>
          <TableHead>Penempatan</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedEmployees.map((employee) => (
          <EmployeeTableRow
            key={`${employee.karyawan_id}-${employee.auth_id}`}
            employee={employee}
            onDelete={onDelete}
            onResetPassword={onResetPassword}
          />
        ))}
      </TableBody>
    </Table>
  );
};
