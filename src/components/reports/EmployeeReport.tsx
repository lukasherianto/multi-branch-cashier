
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Employee {
  karyawan_id: number;
  name: string;
  role: string;
  cabang?: {
    branch_name: string;
  };
}

interface AttendanceRecord {
  karyawan_id: number;
  tanggal: string;
  jam_masuk: string;
  jam_keluar: string | null;
  status: string;
}

interface EmployeeData {
  employees: Employee[];
  attendance: AttendanceRecord[];
}

const EmployeeReport = () => {
  const { data: employeeData } = useQuery<EmployeeData, Error>({
    queryKey: ["employee-report"],
    queryFn: async () => {
      const { data: employees, error: employeeError } = await supabase
        .from("karyawan" as any)
        .select(`
          karyawan_id,
          name,
          role,
          cabang:cabang_id (
            branch_name
          )
        `);

      if (employeeError) throw employeeError;

      const { data: attendance, error: attendanceError } = await supabase
        .from("absensi")
        .select(`
          karyawan_id,
          tanggal,
          jam_masuk,
          jam_keluar,
          status
        `);

      if (attendanceError) throw attendanceError;

      return {
        employees: employees as Employee[] || [],
        attendance: attendance as AttendanceRecord[] || [],
      };
    },
  });

  const getEmployeeAttendance = (karyawanId: number) => {
    return employeeData?.attendance.filter(a => a.karyawan_id === karyawanId) || [];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Karyawan</h3>
          <p className="text-3xl font-bold text-mint-600">
            {employeeData?.employees.length || 0}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Kinerja Karyawan</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead className="text-right">Kehadiran Bulan Ini</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeeData?.employees.map((employee) => {
              const attendance = getEmployeeAttendance(employee.karyawan_id);
              const presentDays = attendance.filter(a => a.status === 'hadir').length;

              return (
                <TableRow key={employee.karyawan_id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.cabang?.branch_name || '-'}</TableCell>
                  <TableCell className="text-right">{presentDays} hari</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default EmployeeReport;
