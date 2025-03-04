
import { Button } from "@/components/ui/button";
import { Trash2, Lock } from "lucide-react";
import { Employee } from "./types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useEmployeePasswordReset } from "./useEmployeePasswordReset";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmployeeListProps {
  employees: Employee[];
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const EmployeeList = ({ employees, onDelete, isLoading }: EmployeeListProps) => {
  // Separate employees into two groups
  const currentBusinessEmployees = employees.filter(emp => emp.isSameBusiness);
  const otherBusinessEmployees = employees.filter(emp => !emp.isSameBusiness);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const { resetPassword, isResetting } = useEmployeePasswordReset();

  const handlePasswordReset = async () => {
    if (selectedEmployee && newPassword) {
      await resetPassword(selectedEmployee.auth_id || "", newPassword);
      setSelectedEmployee(null);
      setNewPassword("");
    }
  };

  const handleEmployeeClick = (employee: Employee) => {
    if (employee.isSameBusiness && employee.auth_id) {
      setSelectedEmployee(employee);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Business Employees */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Karyawan Usaha Anda</h4>
        <div className="space-y-4">
          {currentBusinessEmployees.map((employee) => (
            <div
              key={employee.karyawan_id}
              className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleEmployeeClick(employee)}
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEmployeeClick(employee);
                  }}
                  disabled={isLoading || !employee.auth_id}
                  title="Reset Password"
                >
                  <Lock className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(employee.karyawan_id);
                  }}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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

      {/* Password Reset Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password Karyawan</DialogTitle>
            <DialogDescription>
              Masukkan password baru untuk karyawan {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="Masukkan password baru" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedEmployee(null);
                setNewPassword("");
              }}
            >
              Batal
            </Button>
            <Button 
              onClick={handlePasswordReset} 
              disabled={!newPassword || isResetting}
            >
              {isResetting ? "Menyimpan..." : "Simpan Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
