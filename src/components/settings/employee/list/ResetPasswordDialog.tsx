
import { useState } from "react";
import { Employee } from "../types";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResetPasswordDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetPassword: (auth_id: string, newPassword: string) => Promise<boolean>;
  resettingId: string | null;
  setResettingId: (id: string | null) => void;
}

export const ResetPasswordDialog = ({
  employee,
  open,
  onOpenChange,
  onResetPassword,
  resettingId,
  setResettingId,
}: ResetPasswordDialogProps) => {
  const [resetPassword, setResetPassword] = useState("");

  const handleResetPassword = async () => {
    if (employee.auth_id && resetPassword) {
      setResettingId(employee.auth_id);
      const success = await onResetPassword(employee.auth_id, resetPassword);
      if (success) {
        onOpenChange(false);
        setResetPassword("");
      }
      setResettingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password Karyawan</DialogTitle>
          <DialogDescription>
            Masukkan password baru untuk {employee.name}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button 
            type="submit" 
            onClick={handleResetPassword} 
            disabled={resetPassword.length < 6 || resettingId === employee.auth_id}
          >
            {resettingId === employee.auth_id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
