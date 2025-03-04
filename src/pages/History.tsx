
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

type SupabaseTransaction = {
  transaksi_id: number;
  transaction_date: string;
  created_at: string;
  quantity: number;
  total_price: number;
  payment_status: number;
  payment_method?: string;
  produk: {
    produk_id: number;
    product_name: string;
  };
  cabang: {
    branch_name: string;
  };
};

const History = () => {
  const [transactions, setTransactions] = useState<TransactionForTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pelakuUsaha } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!pelakuUsaha?.pelaku_usaha_id) return;
      
      setIsLoading(true);
      try {
        // Using a more type-safe approach to prevent deep nesting type errors
        const { data, error } = await supabase
          .from('transaksi')
          .select(`
            transaksi_id,
            transaction_date,
            created_at,
            quantity,
            total_price,
            payment_status,
            payment_method,
            produk:produk_id(produk_id, product_name),
            cabang:cabang_id(branch_name)
          `)
          .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          return;
        }

        // Transform data to match TransactionForTable interface
        const transformedData: TransactionForTable[] = (data || []).map((item: any) => ({
          transaksi_id: item.transaksi_id,
          transaction_date: item.transaction_date || item.created_at,
          produk: {
            produk_id: item.produk?.produk_id || 0,
            product_name: item.produk?.product_name || 'Unknown'
          },
          quantity: item.quantity || 0,
          total_price: item.total_price || 0,
          payment_status: item.payment_status || 0,
          cabang: {
            branch_name: item.cabang?.branch_name || ''
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
