
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2 } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-mint-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Business Employees */}
      <div>
        <h4 className="text-sm font-semibold mb-3">List Karyawan</h4>
        
        {currentBusinessEmployees.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBusinessEmployees.map((employee) => (
                <TableRow key={employee.karyawan_id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email || "-"}</TableCell>
                  <TableCell>{employee.role || "-"}</TableCell>
                  <TableCell>{employee.cabang?.branch_name || "Pusat"}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(employee.karyawan_id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded">
            Belum ada karyawan terdaftar
          </p>
        )}
      </div>

      {/* Other Business Employees */}
      {otherBusinessEmployees.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">List Karyawan Usaha Lain</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Usaha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-muted/50">
              {otherBusinessEmployees.map((employee) => (
                <TableRow key={employee.karyawan_id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email || "-"}</TableCell>
                  <TableCell>{employee.role || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {employee.businessName}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
