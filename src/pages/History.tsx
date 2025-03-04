
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryTabs } from '@/components/history/HistoryTabs';
import { useTransactionData } from '@/hooks/history/useTransactionData';
import { useTransactionActions } from '@/hooks/history/useTransactionActions';
import { toast } from 'sonner';

const History = () => {
  const { pelakuUsaha } = useAuth();
  const { transactions, isLoading } = useTransactionData(pelakuUsaha?.pelaku_usaha_id);
  const {
    handleUpdatePaymentStatus,
    handlePayDebt,
    handlePrint,
    handleWhatsApp,
    handleReturSuccess,
    handleCancelTransaction
  } = useTransactionActions();

  useEffect(() => {
    if (!pelakuUsaha) {
      console.log("No pelakuUsaha data available");
    } else {
      console.log("pelakuUsaha ID:", pelakuUsaha.pelaku_usaha_id);
    }
  }, [pelakuUsaha]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryTabs
            transactions={transactions}
            isLoading={isLoading}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onPayDebt={handlePayDebt}
            onPrint={handlePrint}
            onWhatsApp={handleWhatsApp}
            onReturSuccess={handleReturSuccess}
            onCancelTransaction={handleCancelTransaction}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
