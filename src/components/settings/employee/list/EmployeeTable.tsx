
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
  onDelete: (id: number) => Promise<void>;
  onResetPassword: (auth_id: string, newPassword: string) => Promise<boolean>;
}

export const EmployeeTable = ({ 
  employees, 
  onDelete, 
  onResetPassword 
}: EmployeeTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Jabatan</TableHead>
          <TableHead>Penempatan</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <EmployeeTableRow
            key={employee.karyawan_id}
            employee={employee}
            onDelete={onDelete}
            onResetPassword={onResetPassword}
          />
        ))}
      </TableBody>
    </Table>
  );
};
