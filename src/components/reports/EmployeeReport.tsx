
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const EmployeeReport = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Karyawan</h3>
          <p className="text-3xl font-bold text-mint-600">1</p>
        </Card>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Fitur manajemen karyawan telah dinonaktifkan. Aplikasi ini hanya untuk pengguna pemilik usaha.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Data Pemilik Usaha</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Cabang</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Pemilik Usaha</TableCell>
              <TableCell>Pelaku Usaha</TableCell>
              <TableCell>Pusat</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default EmployeeReport;
