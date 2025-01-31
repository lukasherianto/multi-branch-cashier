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

const InventoryReport = () => {
  const { data: inventory } = useQuery({
    queryKey: ["inventory-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produk")
        .select(`
          produk_id,
          product_name,
          stock,
          cost_price,
          retail_price,
          kategori_produk (
            kategori_name
          )
        `);

      if (error) throw error;
      return data;
    },
  });

  const lowStockThreshold = 10;
  const lowStockItems = inventory?.filter(item => item.stock <= lowStockThreshold) || [];
  const totalInventoryValue = inventory?.reduce(
    (sum, item) => sum + (Number(item.cost_price) * item.stock),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Produk</h3>
          <p className="text-3xl font-bold text-mint-600">{inventory?.length || 0}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Nilai Inventaris</h3>
          <p className="text-3xl font-bold text-mint-600">
            Rp {totalInventoryValue.toLocaleString("id-ID")}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Stok Menipis</h3>
          <p className="text-3xl font-bold text-mint-600">{lowStockItems.length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Produk Stok Menipis</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Stok</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockItems.map((item) => (
              <TableRow key={item.produk_id}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.kategori_produk.kategori_name}</TableCell>
                <TableCell className="text-right">{item.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Semua Produk</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-right">Nilai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory?.map((item) => (
              <TableRow key={item.produk_id}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.kategori_produk.kategori_name}</TableCell>
                <TableCell className="text-right">{item.stock}</TableCell>
                <TableCell className="text-right">
                  Rp {(Number(item.cost_price) * item.stock).toLocaleString("id-ID")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default InventoryReport;