
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
      
      // Since the transfer_stok table was deleted, we'll create mock data
      // In a real application, you would implement a different way to track transfers
      const mockData: TransferHistoryItem[] = [];
      
      // In a real implementation, you would fetch this data from a database
      // For now, we just display an empty list
      setTransfers(mockData);
      
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
