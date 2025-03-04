
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import StatCard from "./shared/StatCard";
import TransactionHistoryTable from "./financial/TransactionHistoryTable";

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
        <StatCard
          title="Total Penjualan"
          value={`Rp ${totalSales.toLocaleString("id-ID")}`}
        />
        <StatCard
          title="Total Pemasukan Kas"
          value={`Rp ${totalIncome.toLocaleString("id-ID")}`}
        />
        <StatCard
          title="Total Pengeluaran Kas"
          value={`Rp ${totalExpenses.toLocaleString("id-ID")}`}
        />
      </div>

      <TransactionHistoryTable transactions={transactions?.kas || []} />
    </div>
  );
};

export default FinancialReport;
