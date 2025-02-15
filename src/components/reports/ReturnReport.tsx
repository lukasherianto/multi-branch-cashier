
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ReturnReport = () => {
  const { pelakuUsaha } = useAuth();

  const { data: returns } = useQuery({
    queryKey: ["return-report", pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return null;

      // Get all branches for this pelaku usaha
      const { data: branches, error: branchError } = await supabase
        .from('cabang')
        .select('cabang_id')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

      if (branchError) throw branchError;

      const branchIds = branches.map(b => b.cabang_id);

      // Get all transactions for these branches
      const { data: transactions, error: transError } = await supabase
        .from('transaksi')
        .select('transaksi_id')
        .in('cabang_id', branchIds);

      if (transError) throw transError;

      const transactionIds = transactions.map(t => t.transaksi_id);

      // Get returns for these transactions
      const { data, error } = await supabase
        .from("retur")
        .select(`
          retur_id,
          quantity,
          reason,
          retur_date,
          produk:produk_id (
            product_name
          )
        `)
        .in('transaksi_id', transactionIds)
        .order('retur_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!pelakuUsaha
  });

  const totalReturns = returns?.length || 0;
  const totalReturnedItems = returns?.reduce((sum, r) => sum + r.quantity, 0) || 0;

  if (!pelakuUsaha) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Silakan lengkapi profil usaha Anda terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Retur</h3>
          <p className="text-3xl font-bold text-mint-600">{totalReturns}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Barang Diretur</h3>
          <p className="text-3xl font-bold text-mint-600">{totalReturnedItems}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Riwayat Retur</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Alasan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns?.map((retur) => (
              <TableRow key={retur.retur_id}>
                <TableCell>
                  {new Date(retur.retur_date).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>{retur.produk.product_name}</TableCell>
                <TableCell>{retur.quantity}</TableCell>
                <TableCell>{retur.reason || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ReturnReport;
