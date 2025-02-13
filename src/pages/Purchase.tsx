
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplierManagement } from "@/components/pos/SupplierManagement";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { PurchaseForm } from "@/components/pos/forms/PurchaseForm";

const Purchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAddRoute = location.pathname === "/purchase/add";

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      console.log('Fetching purchases data...');
      const { data, error } = await supabase
        .from('pembelian')
        .select(`
          *,
          produk:produk_id(product_name),
          cabang:cabang_id(branch_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }

      console.log('Purchases data:', data);
      return data;
    },
  });

  if (isAddRoute) {
    return <PurchaseForm />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Transaksi Pembelian</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/purchase/add')}
          >
            <Plus className="h-4 w-4" />
            Tambah Pembelian
          </Button>
          <SupplierManagement onSuccess={() => {}} />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Harga Satuan</TableHead>
              <TableHead>Total Harga</TableHead>
              <TableHead>Status Pembayaran</TableHead>
              <TableHead>Jadwal Lunas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : purchases && purchases.length > 0 ? (
              purchases.map((purchase) => (
                <TableRow key={purchase.pembelian_id}>
                  <TableCell>
                    {format(new Date(purchase.transaction_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{purchase.cabang?.branch_name}</TableCell>
                  <TableCell>{purchase.produk?.product_name}</TableCell>
                  <TableCell>{purchase.quantity}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(purchase.unit_price)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(purchase.total_price)}
                  </TableCell>
                  <TableCell>
                    {purchase.payment_status === 1 ? 'Lunas' : 'Belum Lunas'}
                  </TableCell>
                  <TableCell>
                    {purchase.jadwal_lunas 
                      ? format(new Date(purchase.jadwal_lunas), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Tidak ada data transaksi pembelian
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Purchase;
