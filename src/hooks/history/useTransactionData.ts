
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TransactionForTable, RawTransaction } from '@/types/history';

export function useTransactionData(
  pelakuUsahaId: number | undefined, 
  startDate?: Date, 
  endDate?: Date, 
  branchId?: number
) {
  const [transactions, setTransactions] = useState<TransactionForTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!pelakuUsahaId) return;
      
      setIsLoading(true);
      try {
        // First get all branches for this business
        let branchQuery = supabase
          .from('cabang')
          .select('cabang_id')
          .eq('pelaku_usaha_id', pelakuUsahaId);
          
        const { data: branchData, error: branchError } = await branchQuery;
          
        if (branchError) {
          console.error('Error fetching branches:', branchError);
          return;
        }
        
        if (!branchData || branchData.length === 0) {
          console.log('No branches found for this business');
          setTransactions([]);
          setIsLoading(false);
          return;
        }
        
        const branchIds = branchData.map(branch => branch.cabang_id);
        console.log('Found branch IDs:', branchIds);
        
        // Get transactions for all branches of this business
        let query = supabase
          .from('transaksi')
          .select(`transaksi_id, transaction_date, created_at, quantity, total_price, payment_status, payment_method, produk_id, cabang_id`);
        
        // Apply branch filter if provided
        if (branchId) {
          query = query.eq('cabang_id', branchId);
        } else {
          query = query.in('cabang_id', branchIds);
        }
        
        // Apply date filters if provided
        if (startDate) {
          const startDateStr = startDate.toISOString();
          query = query.gte('transaction_date', startDateStr);
        }
        
        if (endDate) {
          // Set time to end of day for inclusive filtering
          const endDateWithTime = new Date(endDate);
          endDateWithTime.setHours(23, 59, 59, 999);
          const endDateStr = endDateWithTime.toISOString();
          query = query.lte('transaction_date', endDateStr);
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;

        if (error) {
          console.error('Error fetching transactions:', error);
          return;
        }

        // Explicitly type the data to avoid deep nesting
        const rawTransactions = data as RawTransaction[];
        console.log('Fetched transactions:', rawTransactions.length);
        
        if (rawTransactions.length === 0) {
          setTransactions([]);
          setIsLoading(false);
          return;
        }
        
        // Get all unique product IDs
        const productIds = [...new Set(rawTransactions.map(t => t.produk_id))];
        const { data: productsData, error: productsError } = await supabase
          .from('produk')
          .select('produk_id, product_name')
          .in('produk_id', productIds);
          
        if (productsError) {
          console.error('Error fetching products:', productsError);
          return;
        }
        
        // Get all unique branch IDs from transactions
        const transactionBranchIds = [...new Set(rawTransactions.map(t => t.cabang_id))];
        const { data: branchesData, error: branchesError } = await supabase
          .from('cabang')
          .select('cabang_id, branch_name')
          .in('cabang_id', transactionBranchIds);
        
        if (branchesError) {
          console.error('Error fetching branches:', branchesError);
          return;
        }
        
        // Create a map for quick lookup
        const productsMap = new Map(productsData.map(p => [p.produk_id, p.product_name]));
        const branchesMap = new Map(branchesData.map(b => [b.cabang_id, b.branch_name]));
        
        // Transform data to match TransactionForTable interface
        const transformedData: TransactionForTable[] = rawTransactions.map(item => ({
          transaksi_id: item.transaksi_id,
          transaction_date: item.transaction_date || item.created_at,
          produk: {
            produk_id: item.produk_id,
            product_name: productsMap.get(item.produk_id) || 'Unknown'
          },
          quantity: item.quantity || 0,
          total_price: item.total_price || 0,
          payment_status: item.payment_status || 0,
          cabang: {
            branch_name: branchesMap.get(item.cabang_id) || ''
          },
          payment_method: item.payment_method
        }));

        console.log('Transformed data:', transformedData.length);
        setTransactions(transformedData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [pelakuUsahaId, startDate, endDate, branchId]);

  return { transactions, isLoading };
}
