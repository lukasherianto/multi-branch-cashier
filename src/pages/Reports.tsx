import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Reports = () => {
  // Fetch daily sales data
  const { data: dailySales } = useQuery({
    queryKey: ["dailySales"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          transaksi_id,
          quantity,
          total_price,
          transaction_date,
          produk:produk_id (product_name),
          cabang:cabang_id (branch_name)
        `)
        .gte("transaction_date", today.toISOString())
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate total sales
  const totalSales = dailySales?.reduce((sum, sale) => sum + Number(sale.total_price), 0) || 0;
  const totalTransactions = dailySales?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Laporan</h2>
        <p className="text-gray-600 mt-2">Ringkasan penjualan dan transaksi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Penjualan Hari Ini</h3>
          <p className="text-3xl font-bold text-mint-600">
            Rp {totalSales.toLocaleString("id-ID")}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Jumlah Transaksi Hari Ini</h3>
          <p className="text-3xl font-bold text-mint-600">
            {totalTransactions}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Transaksi Hari Ini</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailySales?.map((sale) => (
                <TableRow key={sale.transaksi_id}>
                  <TableCell>
                    {format(new Date(sale.transaction_date), "HH:mm", { locale: id })}
                  </TableCell>
                  <TableCell>{sale.cabang.branch_name}</TableCell>
                  <TableCell>{sale.produk.product_name}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>
                    Rp {Number(sale.total_price).toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
              {!dailySales?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Belum ada transaksi hari ini
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;