
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryTabs } from '@/components/history/HistoryTabs';
import { useTransactionData } from '@/hooks/history/useTransactionData';
import { useTransactionActions } from '@/hooks/history/useTransactionActions';

const History = () => {
  const { pelakuUsaha } = useAuth();
  const { transactions, isLoading } = useTransactionData(pelakuUsaha?.pelaku_usaha_id);
  const {
    handleUpdatePaymentStatus,
    handlePayDebt,
    handlePrint,
    handleWhatsApp,
    handleReturSuccess
  } = useTransactionActions();

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
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
