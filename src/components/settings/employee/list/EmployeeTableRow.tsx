
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "./RoleBadge";
import { Employee } from "../types";
import { EmployeeActions } from "./EmployeeActions";
import { DeleteEmployeeDialog } from "./DeleteEmployeeDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

interface EmployeeTableRowProps {
  employee: Employee;
  onDelete: (id: string) => Promise<void>;
  onResetPassword: (auth_id: string, newPassword: string) => Promise<boolean>;
}

export const EmployeeTableRow = ({ 
  employee, 
  onDelete, 
  onResetPassword 
}: EmployeeTableRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!employee.auth_id) return;
    
    setIsDeleting(true);
    try {
      await onDelete(employee.auth_id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow className={!employee.isSameBusiness ? "bg-muted/30" : ""}>
      <TableCell>{employee.name}</TableCell>
      <TableCell>{employee.email}</TableCell>
      <TableCell>{employee.whatsapp || "-"}</TableCell>
      <TableCell>
        <RoleBadge role={employee.role} />
      </TableCell>
      <TableCell>{employee.branch || "-"}</TableCell>
      <TableCell align="right">
        <EmployeeActions 
          employee={employee}
          onDelete={() => setShowDeleteDialog(true)} 
          onResetPassword={() => setShowResetDialog(true)}
        />
      </TableCell>

      {/* Delete Employee Dialog */}
      <DeleteEmployeeDialog
        employee={employee}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={handleDelete}
        isDeleting={isDeleting}
      />
      
      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        employee={employee}
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onResetPassword={onResetPassword}
        resettingId={resettingId}
        setResettingId={setResettingId}
      />
    </TableRow>
  );
};
