
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type TransferHistoryItem = {
  transfer_id: number;
  cabang_id_from: number;
  cabang_id_to: number;
  produk_id: number;
  quantity: number;
  transfer_date: string;
  from_branch_name: string;
  to_branch_name: string;
  product_name: string;
};

export const useTransferHistory = () => {
  const [transfers, setTransfers] = useState<TransferHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchTransferHistory = async (branchId?: number | null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from('transfer_stok')
        .select(`
          transfer_id,
          cabang_id_from,
          cabang_id_to,
          produk_id,
          quantity,
          transfer_date,
          cabang_from:cabang!cabang_id_from(branch_name),
          cabang_to:cabang!cabang_id_to(branch_name),
          produk:produk(product_name)
        `)
        .order('transfer_date', { ascending: false });
      
      if (branchId) {
        // Filter by the selected branch (as either source or destination)
        query = query.or(`cabang_id_from.eq.${branchId},cabang_id_to.eq.${branchId}`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const formattedData = data.map(item => ({
          transfer_id: item.transfer_id,
          cabang_id_from: item.cabang_id_from,
          cabang_id_to: item.cabang_id_to,
          produk_id: item.produk_id,
          quantity: item.quantity,
          transfer_date: item.transfer_date,
          from_branch_name: item.cabang_from?.branch_name || 'Unknown',
          to_branch_name: item.cabang_to?.branch_name || 'Unknown',
          product_name: item.produk?.product_name || 'Unknown Product'
        }));
        
        setTransfers(formattedData);
      }
    } catch (err) {
      console.error('Error fetching transfer history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch transfer history'));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat riwayat transfer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch history on initial load
  useEffect(() => {
    fetchTransferHistory(selectedBranch);
  }, [selectedBranch]);

  const handleBranchChange = (branchId: number | null) => {
    setSelectedBranch(branchId);
  };

  return {
    transfers,
    isLoading,
    error,
    selectedBranch,
    handleBranchChange,
    refreshHistory: () => fetchTransferHistory(selectedBranch)
  };
};
