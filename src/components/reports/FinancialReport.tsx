
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

const FinancialReport = () => {
  const { pelakuUsaha } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["financial-report", pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return null;

      // Get all branches for this pelaku usaha
      const { data: branches, error: branchError } = await supabase
        .from('cabang')
        .select('cabang_id')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

      if (branchError) throw branchError;

      const branchIds = branches.map(b => b.cabang_id);

      const { data: kasData, error: kasError } = await supabase
        .from("kas")
        .select(`
          amount,
          transaction_type,
          description,
          transaction_date
        `)
        .in('cabang_id', branchIds)
        .order('transaction_date', { ascending: false });

      if (kasError) throw kasError;

      const { data: salesData, error: salesError } = await supabase
        .from("transaksi")
        .select(`
          total_price,
          transaction_date
        `)
        .in('cabang_id', branchIds);

      if (salesError) throw salesError;

      return {
        kas: kasData,
        sales: salesData,
      };
    },
    enabled: !!pelakuUsaha
  });

  const totalIncome = transactions?.kas
    .filter(t => t.transaction_type === 'masuk')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const totalExpenses = transactions?.kas
    .filter(t => t.transaction_type === 'keluar')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const totalSales = transactions?.sales
    .reduce((sum, t) => sum + Number(t.total_price), 0) || 0;

  if (!pelakuUsaha) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Silakan lengkapi profil usaha Anda terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Penjualan</h3>
          <p className="text-3xl font-bold text-mint-600">
            Rp {totalSales.toLocaleString("id-ID")}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Pemasukan Kas</h3>
          <p className="text-3xl font-bold text-mint-600">
            Rp {totalIncome.toLocaleString("id-ID")}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Pengeluaran Kas</h3>
          <p className="text-3xl font-bold text-mint-600">
            Rp {totalExpenses.toLocaleString("id-ID")}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Riwayat Transaksi Kas</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.kas.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>
                  {new Date(transaction.transaction_date).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  {transaction.transaction_type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                </TableCell>
                <TableCell>{transaction.description || '-'}</TableCell>
                <TableCell className="text-right">
                  Rp {Number(transaction.amount).toLocaleString("id-ID")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default FinancialReport;
