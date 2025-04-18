import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useState } from "react";
import StatCard from "./shared/StatCard";
import TransactionHistoryTable from "./financial/TransactionHistoryTable";
import DateRangeFilter from "./sales/DateRangeFilter";
import { filterSalesByPeriod } from "./sales/utils";

const FinancialReport = () => {
  const { pelakuUsaha } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    end: new Date(),
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  });

  const { data: transactions } = useQuery({
    queryKey: ["financial-report", pelakuUsaha?.pelaku_usaha_id, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!pelakuUsaha) return null;

      // Get all branches for this pelaku usaha
      const { data: branches, error: branchError } = await supabase
        .from('cabang')
        .select('cabang_id')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

      if (branchError) throw branchError;

      const branchIds = branches.map(b => b.cabang_id);

      // Format date range for query with special handling for daily period
      let startDate, endDate;
      
      if (dateRange.period === 'daily') {
        // For daily period, ensure we're getting just today's data
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
      } else if (dateRange.period === 'weekly') {
        // For weekly period, get data for the current week (Sunday to Saturday)
        const today = new Date();
        const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - day);
        firstDayOfWeek.setHours(0, 0, 0, 0);
        
        startDate = firstDayOfWeek.toISOString();
        endDate = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
      } else {
        startDate = dateRange.start ? dateRange.start.toISOString() : undefined;
        endDate = dateRange.end 
          ? new Date(dateRange.end.setHours(23, 59, 59, 999)).toISOString() 
          : undefined;
      }

      console.log('Date range:', { period: dateRange.period, startDate, endDate });

      // Fetch cash transactions with date filtering
      const { data: kasData, error: kasError } = await supabase
        .from("kas")
        .select(`
          amount,
          transaction_type,
          description,
          transaction_date
        `)
        .in('cabang_id', branchIds)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false });

      if (kasError) throw kasError;

      // Fetch sales data with date filtering
      const { data: salesData, error: salesError } = await supabase
        .from("transaksi")
        .select(`
          total_price,
          transaction_date
        `)
        .in('cabang_id', branchIds)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (salesError) throw salesError;

      return {
        kas: kasData,
        sales: salesData,
      };
    },
    enabled: !!pelakuUsaha
  });

  const handleDateRangeChange = (range: { 
    start: Date | undefined; 
    end: Date | undefined; 
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  }) => {
    setDateRange(range);
  };

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
      <DateRangeFilter onFilterChange={handleDateRangeChange} />
      
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
