
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionTable } from "./TransactionTable";
import { Loader2 } from "lucide-react";
import { TransactionForTable } from "@/types/history";

interface HistoryTabsProps {
  transactions: TransactionForTable[];
  isLoading: boolean;
  onUpdatePaymentStatus: (transactionId: number, currentStatus: number) => void;
  onPayDebt: (transactionId: number) => void;
  onPrint: (transaction: TransactionForTable) => void;
  onWhatsApp: (transaction: TransactionForTable) => void;
  onReturSuccess: () => void;
}

export const HistoryTabs = ({
  transactions,
  isLoading,
  onUpdatePaymentStatus,
  onPayDebt,
  onPrint,
  onWhatsApp,
  onReturSuccess,
}: HistoryTabsProps) => {
  return (
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
            onUpdatePaymentStatus={onUpdatePaymentStatus}
            onPayDebt={onPayDebt}
            onPrint={onPrint}
            onWhatsApp={onWhatsApp}
            onReturSuccess={onReturSuccess}
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
            onUpdatePaymentStatus={onUpdatePaymentStatus}
            onPayDebt={onPayDebt}
            onPrint={onPrint}
            onWhatsApp={onWhatsApp}
            onReturSuccess={onReturSuccess}
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
            onUpdatePaymentStatus={onUpdatePaymentStatus}
            onPayDebt={onPayDebt}
            onPrint={onPrint}
            onWhatsApp={onWhatsApp}
            onReturSuccess={onReturSuccess}
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
            onUpdatePaymentStatus={onUpdatePaymentStatus}
            onPayDebt={onPayDebt}
            onPrint={onPrint}
            onWhatsApp={onWhatsApp}
            onReturSuccess={onReturSuccess}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};
