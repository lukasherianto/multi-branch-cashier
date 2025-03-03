import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import TransferFilter from "./TransferFilter";
import TransferHistoryTable from "./TransferHistoryTable";

interface Transfer {
  transfer_id: number;
  transfer_date: string;
  quantity: number;
  produk: {
    product_name: string;
  } | null;
  cabang_from: {
    branch_name: string;
  } | null;
  cabang_to: {
    branch_name: string;
  } | null;
  batch_number?: string;
}

const TransferHistory = () => {
  const [branchFilter, setBranchFilter] = useState<string>("all");
  
  // Query to get branches for the filter
  const { data: branches = [] } = useQuery({
    queryKey: ['branches-for-filter'],
    queryFn: async () => {
      const userResponse = await supabase.auth.getUser();
      
      if (!userResponse.data.user) {
        return [];
      }
      
      const { data: pelakuUsaha } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', userResponse.data.user.id)
        .maybeSingle();

      if (!pelakuUsaha) {
        return [];
      }
      
      const { data } = await supabase
        .from('cabang')
        .select('cabang_id, branch_name')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
        .order('branch_name', { ascending: true });
        
      return data || [];
    },
    retry: 1,
    staleTime: 60000,
  });

  const { data: transfers = [], isLoading, error } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      console.log("Starting transfer data fetch");
      try {
        const userResponse = await supabase.auth.getUser();
        console.log("Auth user response:", userResponse);
        
        if (!userResponse.data.user) {
          console.error("No authenticated user found");
          return [];
        }
        
        const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
          .from('pelaku_usaha')
          .select('pelaku_usaha_id')
          .eq('user_id', userResponse.data.user.id)
          .maybeSingle();

        if (pelakuUsahaError) {
          console.error("Error fetching pelaku usaha:", pelakuUsahaError);
          return [];
        }

        console.log("Pelaku usaha data:", pelakuUsaha);
        if (!pelakuUsaha) {
          console.log("No pelaku usaha found");
          return [];
        }

        // Fetch transfers with proper joins
        const { data: transferData, error: transferError } = await supabase
          .from('transfer_stok')
          .select(`
            transfer_id,
            transfer_date,
            quantity,
            produk:produk_id (
              product_name
            ),
            cabang_from:cabang!cabang_id_from (
              branch_name
            ),
            cabang_to:cabang!cabang_id_to (
              branch_name
            )
          `)
          .order('transfer_date', { ascending: false });

        if (transferError) {
          console.error('Error fetching transfers:', transferError);
          return [];
        }

        console.log("Transfer data fetched:", transferData);

        // Generate batch numbers based on transfer date
        // Transfers with the same date should have the same batch number
        const batchMap = new Map<string, string>();
        let batchCounter = 1;

        // Transform the data to match the Transfer interface with batch numbers
        const formattedTransfers: Transfer[] = (transferData || []).map(transfer => {
          // Create a date key for grouping transfers (just the date part, not time)
          const dateKey = new Date(transfer.transfer_date).toISOString().split('T')[0];
          
          // If we haven't seen this date before, assign a new batch number
          if (!batchMap.has(dateKey)) {
            batchMap.set(dateKey, `TRF-${dateKey.replace(/-/g, '')}-${batchCounter}`);
            batchCounter++;
          }
          
          return {
            transfer_id: transfer.transfer_id,
            transfer_date: transfer.transfer_date,
            quantity: transfer.quantity,
            produk: transfer.produk,
            cabang_from: {
              branch_name: transfer.cabang_from?.branch_name || 'Unknown'
            },
            cabang_to: {
              branch_name: transfer.cabang_to?.branch_name || 'Unknown'
            },
            batch_number: batchMap.get(dateKey)
          };
        });

        return formattedTransfers;
      } catch (error) {
        console.error('Error in transfer query:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 30000,
  });

  // Filter transfers based on selected branch
  const filteredTransfers = transfers.filter(transfer => {
    if (branchFilter === "all") {
      return true;
    }
    
    return (
      transfer.cabang_from?.branch_name === branchFilter ||
      transfer.cabang_to?.branch_name === branchFilter
    );
  });

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg">Memuat data transfer stok...</p>
      </div>
    );
  }
  
  if (error) {
    console.error("Error in transfers query:", error);
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal memuat data transfer stok. Silakan coba lagi nanti.
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Riwayat Transfer</h3>
      
      <TransferFilter
        branches={branches}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
      />
      
      <TransferHistoryTable 
        transfers={filteredTransfers} 
        branchFilter={branchFilter} 
      />
    </div>
  );
};

export default TransferHistory;
