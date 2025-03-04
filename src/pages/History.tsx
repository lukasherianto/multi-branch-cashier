
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { TransactionTable } from '@/components/history/TransactionTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface TransactionForTable {
  transaksi_id: number;
  transaction_date: string;
  produk: {
    produk_id: number;
    product_name: string;
  };
  quantity: number;
  total_price: number;
  payment_status: number;
  cabang: {
    branch_name: string;
  };
  payment_method?: string;
}

// Define a simpler type for the raw data returned from Supabase
interface RawTransaction {
  transaksi_id: number;
  transaction_date: string;
  created_at: string;
  quantity: number;
  total_price: number;
  payment_status: number;
  payment_method?: string;
  produk_id: number;
  cabang_id: number;
}

const History = () => {
  const [transactions, setTransactions] = useState<TransactionForTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pelakuUsaha } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!pelakuUsaha?.pelaku_usaha_id) return;
      
      setIsLoading(true);
      try {
        // Use string interpolation instead of template literals to avoid TypeScript parsing the query structure
        const query = "transaksi_id, transaction_date, created_at, quantity, total_price, payment_status, payment_method, produk_id, cabang_id";
        
        const { data, error } = await supabase
          .from('transaksi')
          .select(query)
          .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
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
  }, [pelakuUsaha?.pelaku_usaha_id]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TransactionTable 
                  transactions={transactions} 
                  onUpdatePaymentStatus={() => {}}
                  onPayDebt={() => {}}
                  onPrint={() => {}}
                  onWhatsApp={() => {}}
                  onReturSuccess={() => {}}
                />
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TransactionTable 
                  transactions={transactions.filter(t => t.payment_status === 1)} 
                  onUpdatePaymentStatus={() => {}}
                  onPayDebt={() => {}}
                  onPrint={() => {}}
                  onWhatsApp={() => {}}
                  onReturSuccess={() => {}}
                />
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TransactionTable 
                  transactions={transactions.filter(t => t.payment_status === 0)} 
                  onUpdatePaymentStatus={() => {}}
                  onPayDebt={() => {}}
                  onPrint={() => {}}
                  onWhatsApp={() => {}}
                  onReturSuccess={() => {}}
                />
              )}
            </TabsContent>
            
            <TabsContent value="cancelled">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TransactionTable 
                  transactions={transactions.filter(t => t.payment_status === 2)} 
                  onUpdatePaymentStatus={() => {}}
                  onPayDebt={() => {}}
                  onPrint={() => {}}
                  onWhatsApp={() => {}}
                  onReturSuccess={() => {}}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
