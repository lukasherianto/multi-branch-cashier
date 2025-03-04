
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PelakuUsaha } from "@/types/auth";

interface DateRange {
  start: Date | undefined;
  end: Date | undefined;
  period: 'daily' | 'monthly' | 'yearly' | 'custom';
}

export const useReportData = (pelakuUsaha: PelakuUsaha | null, dateRange: DateRange) => {
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ["sales-report", pelakuUsaha?.pelaku_usaha_id, dateRange.start, dateRange.end],
    queryFn: async () => {
      console.log("Fetching sales data for:", {
        pelakuUsahaId: pelakuUsaha?.pelaku_usaha_id,
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      if (!pelakuUsaha) {
        console.log("No pelakuUsaha data, returning null");
        return null;
      }

      const startDate = dateRange.start ? dateRange.start.toISOString() : undefined;
      const endDate = dateRange.end 
        ? new Date(dateRange.end.setHours(23, 59, 59, 999)).toISOString() 
        : undefined;

      console.log("Date range for query:", { startDate, endDate });

      try {
        let query = supabase
          .from("transaksi")
          .select(`
            transaksi_id,
            quantity,
            total_price,
            transaction_date,
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

        // Convert pelaku_usaha_id to number to fix type error
        const pelakuUsahaId = typeof pelakuUsaha.pelaku_usaha_id === 'string' 
          ? parseInt(pelakuUsaha.pelaku_usaha_id, 10)
          : pelakuUsaha.pelaku_usaha_id;
          
        // Filter by pelaku_usaha_id by joining with the cabang table
        query = query.eq('cabang.pelaku_usaha_id', pelakuUsahaId);

        const { data, error } = await query.order('transaction_date', { ascending: false });

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        console.log("Sales data fetch success, records:", data?.length);
        return data;
      } catch (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
    },
    enabled: !!pelakuUsaha,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  return { salesData, isLoading, error };
};
