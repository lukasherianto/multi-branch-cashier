
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

const EmployeeReport = () => {
  const { data: employeeData } = useQuery({
    queryKey: ["employee-report"],
    queryFn: async () => {
      // Fetch employee data from profiles table
      const { data: employees, error: employeeError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          whatsapp_number,
          role,
          business_role,
          cabang:cabang_id (
            branch_name
          )
        `)
        .eq("is_employee", true);

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

      // Get role descriptions from user_status
      const { data: userStatus, error: statusError } = await supabase
        .from("user_status")
        .select(`
          wewenang,
          uraian
        `);
      
      if (statusError) throw statusError;

      // Create a map of wewenang (role) to role description
      const roleMap = new Map();
      userStatus?.forEach(status => {
        roleMap.set(status.wewenang, status.uraian);
      });

      // Enrich employee data with role information
      const enrichedEmployees = employees?.map(employee => {
        const role = employee.role ? 
          roleMap.get(employee.role) || "Karyawan" : 
          "Karyawan";
        
        return {
          ...employee,
          name: employee.full_name,
          whatsapp_contact: employee.whatsapp_number,
          role
        };
      });

      return {
        employees: enrichedEmployees || [],
        attendance,
      };
    },
  });

  // This function now needs to match attendance based on profile id instead of karyawan_id
  const getEmployeeAttendance = (employeeId: string) => {
    // Since attendance still uses karyawan_id and we don't have that linkage anymore,
    // we cannot properly match employees to attendance records
    // This would require updating the absensi table structure
    return [];
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
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead className="text-right">Kehadiran Bulan Ini</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeeData?.employees.map((employee) => {
              const presentDays = 0; // Cannot get attendance properly without karyawan_id linkage

              return (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email || '-'}</TableCell>
                  <TableCell>{employee.whatsapp_contact || '-'}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.cabang?.branch_name || '-'}</TableCell>
                  <TableCell className="text-right">Data tidak tersedia</TableCell>
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
