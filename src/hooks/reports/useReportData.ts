
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PelakuUsaha } from "@/types/auth";

interface DateRange {
  start: Date | undefined;
  end: Date | undefined;
  period: 'daily' | 'monthly' | 'yearly' | 'custom';
}

export const useReportData = (pelakuUsaha: PelakuUsaha | null, dateRange: DateRange) => {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales-report", pelakuUsaha?.pelaku_usaha_id, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!pelakuUsaha) return null;

      const startDate = dateRange.start ? dateRange.start.toISOString() : undefined;
      const endDate = dateRange.end 
        ? new Date(dateRange.end.setHours(23, 59, 59, 999)).toISOString() 
        : undefined;

      let query = supabase
        .from("transaksi")
        .select(`
          transaksi_id,
          quantity,
          total_price,
          produk:produk_id (
            produk_id,
            product_name,
            cost_price,
            kategori_produk (
              kategori_name
            )
          ),
          cabang:cabang_id (
            branch_name
          )
        `);

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query.order('transaction_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!pelakuUsaha
  });

  return { salesData, isLoading };
};
