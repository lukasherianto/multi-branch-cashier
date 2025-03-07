
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
          whatsapp_number,
          business_role,
          is_employee,
          cabang:cabang_id (
            branch_name
          )
        `)
        .eq("is_employee", true);

      if (employeeError) throw employeeError;

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
        // Get role from business_role or default to "Karyawan"
        const roleName = employee.business_role || "Karyawan";
        const roleDescription = roleMap.get(roleName) || roleName;
        
        return {
          ...employee,
          name: employee.full_name,
          whatsapp_contact: employee.whatsapp_number,
          role: roleDescription
        };
      }) || [];

      return {
        employees: enrichedEmployees,
        attendance: []  // We'll address attendance in a separate update
      };
    },
  });

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
              <TableHead>WhatsApp</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead className="text-right">Kehadiran Bulan Ini</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeeData?.employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.whatsapp_contact || '-'}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>{employee.cabang?.branch_name || '-'}</TableCell>
                <TableCell className="text-right">Data tidak tersedia</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default EmployeeReport;
