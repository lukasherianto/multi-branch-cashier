
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function EmployeeForm() {
  return (
    <div className="space-y-6">
      <Alert variant="default" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Fitur manajemen karyawan telah dinonaktifkan. Aplikasi ini hanya untuk pengguna pemilik usaha.
        </AlertDescription>
      </Alert>
    </div>
  );
}
