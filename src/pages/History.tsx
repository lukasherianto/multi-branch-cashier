
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { TransactionTable } from '@/components/history/TransactionTable';
import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const History = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pelakuUsaha } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!pelakuUsaha?.pelaku_usaha_id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('transaksi')
          .select('*, produk(*), cabang(*)')
          .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          return;
        }

        // Transform data to match Transaction interface
        const transformedData: Transaction[] = (data || []).map((item: any) => ({
          id: item.transaksi_id,
          transaksi_id: item.transaksi_id,
          transaction_date: item.transaction_date,
          produk: item.produk,
          quantity: item.quantity,
          total_price: item.total_price,
          payment_status: item.payment_status,
          cabang: item.cabang,
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

  // Helper function to convert transaction data to the expected format
  const formatTransactionsForTable = (data: Transaction[]): any[] => {
    return data.map(transaction => ({
      transaksi_id: transaction.transaksi_id,
      transaction_date: transaction.transaction_date || transaction.created_at || '',
      produk: transaction.produk || { 
        produk_id: transaction.produk_id || 0, 
        product_name: transaction.customer_name || 'Unknown' 
      },
      quantity: transaction.quantity || 0,
      total_price: transaction.total_price || transaction.total_amount || 0,
      payment_status: transaction.payment_status || (transaction.status === 'completed' ? 1 : 0),
      cabang: transaction.cabang || { branch_name: '' }
    }));
  };

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
                  transactions={formatTransactionsForTable(transactions)} 
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
                  transactions={formatTransactionsForTable(transactions.filter(t => 
                    t.payment_status === 1 || t.status === 'completed'
                  ))}
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
                  transactions={formatTransactionsForTable(transactions.filter(t => 
                    t.payment_status === 0 || t.status === 'pending'
                  ))}
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
                  transactions={formatTransactionsForTable(transactions.filter(t => 
                    t.payment_status === 2 || t.status === 'cancelled'
                  ))}
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
