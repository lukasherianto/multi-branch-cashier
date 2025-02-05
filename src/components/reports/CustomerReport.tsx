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

const CustomerReport = () => {
  const { data: customers } = useQuery({
    queryKey: ["customer-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pelanggan")
        .select(`
          pelanggan_id,
          nama,
          whatsapp
        `);

      if (error) throw error;
      return data;
    },
  });

  const totalCustomers = customers?.length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Pelanggan</h3>
          <p className="text-3xl font-bold text-mint-600">{totalCustomers}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Daftar Pelanggan</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>WhatsApp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.pelanggan_id}>
                <TableCell>{customer.nama}</TableCell>
                <TableCell>{customer.whatsapp || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CustomerReport;