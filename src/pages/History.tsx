
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryTabs } from '@/components/history/HistoryTabs';
import { useTransactionData } from '@/hooks/history/useTransactionData';
import { useTransactionActions } from '@/hooks/history/useTransactionActions';
import { HistoryFilters } from '@/components/history/HistoryFilters';
import { supabase } from '@/integrations/supabase/client';

const History = () => {
  const { pelakuUsaha } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);
  const [branches, setBranches] = useState<{ cabang_id: number; branch_name: string }[]>([]);
  
  const { transactions, isLoading } = useTransactionData(
    pelakuUsaha?.pelaku_usaha_id, 
    startDate, 
    endDate, 
    selectedBranchId
  );
  
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
      return;
    }
    
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('cabang')
          .select('cabang_id, branch_name')
          .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);
          
        if (error) {
          console.error('Error fetching branches:', error);
          return;
        }
        
        setBranches(data || []);
      } catch (error) {
        console.error('Error in fetchBranches:', error);
      }
    };
    
    fetchBranches();
  }, [pelakuUsaha]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryFilters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            selectedBranchId={selectedBranchId}
            onBranchChange={setSelectedBranchId}
            branches={branches}
          />
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
