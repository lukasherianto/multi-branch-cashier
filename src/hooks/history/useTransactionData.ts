
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TransactionForTable, RawTransaction } from '@/types/history';

export function useTransactionData(pelakuUsahaId: number | undefined) {
  const [transactions, setTransactions] = useState<TransactionForTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!pelakuUsahaId) return;
      
      setIsLoading(true);
      try {
        // Use explicit string for the select query to avoid TypeScript analyzing it deeply
        const { data, error } = await supabase
          .from('transaksi')
          .select("transaksi_id, transaction_date, created_at, quantity, total_price, payment_status, payment_method, produk_id, cabang_id")
          .eq('pelaku_usaha_id', pelakuUsahaId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          return;
        }

        // Explicitly type the data to avoid deep nesting
        const rawTransactions = data as RawTransaction[];
        
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
        
        // Get all unique branch IDs
        const branchIds = [...new Set(rawTransactions.map(t => t.cabang_id))];
        const { data: branchesData, error: branchesError } = await supabase
          .from('cabang')
          .select('cabang_id, branch_name')
          .in('cabang_id', branchIds);
        
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

        setTransactions(transformedData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [pelakuUsahaId]);

  return { transactions, isLoading };
}
