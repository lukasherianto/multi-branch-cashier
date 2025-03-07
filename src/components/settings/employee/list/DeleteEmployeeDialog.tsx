
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { Employee } from "../types";
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

interface DeleteEmployeeDialogProps {
  employee: Employee;
  onDelete: (id: string) => Promise<void>;
  deletingId: string | null;
}

export const DeleteEmployeeDialog = ({ 
  employee, 
  onDelete, 
  deletingId 
}: DeleteEmployeeDialogProps) => {
  return (
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
            onClick={() => employee.auth_id && onDelete(employee.auth_id)}
          >
            {deletingId === employee.auth_id ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
