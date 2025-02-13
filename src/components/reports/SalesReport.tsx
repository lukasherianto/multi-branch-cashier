
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

const SalesReport = () => {
  const { data: salesData } = useQuery({
    queryKey: ["sales-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          transaksi_id,
          quantity,
          total_price,
          produk:produk_id (
            product_name,
            kategori_produk (
              kategori_name
            )
          ),
          cabang:cabang_id (
            branch_name
          )
        `);

      if (error) throw error;
      return data;
    },
  });

  // Calculate total transactions and revenue from valid data only
  const totalTransactions = salesData?.length || 0;
  const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_price), 0) || 0;

  // Calculate product sales from valid data only
  const productSales = salesData?.reduce((acc, sale) => {
    if (sale.produk && sale.produk.product_name) {
      const productName = sale.produk.product_name;
      acc[productName] = (acc[productName] || 0) + sale.quantity;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate category sales from valid data only
  const categorySales = salesData?.reduce((acc, sale) => {
    if (sale.produk?.kategori_produk?.kategori_name) {
      const category = sale.produk.kategori_produk.kategori_name;
      acc[category] = (acc[category] || 0) + Number(sale.total_price);
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Transaksi</h3>
          <p className="text-3xl font-bold text-mint-600">{totalTransactions}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Pendapatan</h3>
          <p className="text-3xl font-bold text-mint-600">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Produk Terlaris</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead className="text-right">Jumlah Terjual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(productSales)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([product, quantity]) => (
                <TableRow key={product}>
                  <TableCell>{product}</TableCell>
                  <TableCell className="text-right">{quantity}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Penjualan per Kategori</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Total Penjualan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(categorySales)
              .sort(([, a], [, b]) => b - a)
              .map(([category, total]) => (
                <TableRow key={category}>
                  <TableCell>{category}</TableCell>
                  <TableCell className="text-right">
                    Rp {total.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SalesReport;
