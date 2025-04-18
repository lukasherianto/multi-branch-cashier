
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export const useReturnReport = () => {
  const { pelakuUsaha } = useAuth();

  const { data: returns, isLoading } = useQuery({
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

  return {
    returns,
    isLoading,
    totalReturns,
    totalReturnedItems,
    pelakuUsaha
  };
};
