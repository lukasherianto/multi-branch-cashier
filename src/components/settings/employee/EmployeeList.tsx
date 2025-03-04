
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Employee } from "./types";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Edit, Key } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth";

interface EmployeeListProps {
  employees: Employee[];
  onDelete: (id: number) => Promise<void>;
  onResetPassword: (auth_id: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

export const EmployeeList = ({ employees, onDelete, onResetPassword, isLoading }: EmployeeListProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { userRole } = useAuth();

  // Check if current user role has permission to reset passwords
  const canResetPassword = userRole === 'pelaku_usaha' || userRole === 'admin';

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const handleResetPassword = async () => {
    if (selectedEmployee?.auth_id && resetPassword) {
      const success = await onResetPassword(selectedEmployee.auth_id, resetPassword);
      if (success) {
        setOpenResetDialog(false);
        setResetPassword("");
        setSelectedEmployee(null);
      }
    }
  };

  const openPasswordReset = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenResetDialog(true);
  };

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

  if (employees.length === 0 && !isLoading) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">Belum ada data karyawan</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden">
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.karyawan_id}>
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
                    <div className="flex justify-end gap-2">
                      {employee.auth_id && canResetPassword && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openPasswordReset(employee)}
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Karyawan</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus karyawan{" "}
                              <span className="font-bold">{employee.name}</span>? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDelete(employee.karyawan_id)}
                            >
                              {deletingId === employee.karyawan_id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={openResetDialog} onOpenChange={setOpenResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password Karyawan</DialogTitle>
            <DialogDescription>
              Masukkan password baru untuk {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input
                id="new-password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenResetDialog(false)}>
              Batal
            </Button>
            <Button type="submit" onClick={handleResetPassword} disabled={resetPassword.length < 6 || resettingId === selectedEmployee?.auth_id}>
              {resettingId === selectedEmployee?.auth_id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
