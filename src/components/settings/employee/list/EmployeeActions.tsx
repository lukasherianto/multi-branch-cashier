
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Employee } from "../types";
import { Key, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { DeleteEmployeeDialog } from "./DeleteEmployeeDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

interface EmployeeActionsProps {
  employee: Employee;
  onDelete: (id: number) => Promise<void>;
  onResetPassword: (auth_id: string, newPassword: string) => Promise<boolean>;
}

export const EmployeeActions = ({ 
  employee, 
  onDelete, 
  onResetPassword 
}: EmployeeActionsProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const { userRole } = useAuth();

  // Check if current user role has permission to reset passwords
  const canResetPassword = userRole === 'pelaku_usaha' || userRole === 'admin';

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="flex justify-end gap-2">
      {employee.auth_id && canResetPassword && (
        <>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setOpenResetDialog(true)}
            title="Reset Password"
          >
            <Key className="h-4 w-4" />
          </Button>
          
          <ResetPasswordDialog
            employee={employee}
            open={openResetDialog}
            onOpenChange={setOpenResetDialog}
            onResetPassword={onResetPassword}
            resettingId={resettingId}
            setResettingId={setResettingId}
          />
        </>
      )}
      
      <DeleteEmployeeDialog 
        employee={employee} 
        onDelete={handleDelete} 
        deletingId={deletingId} 
      />
    </div>
  );
};
