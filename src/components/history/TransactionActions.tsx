
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare, CreditCard, XCircle } from "lucide-react";
import { ReturForm } from "@/components/history/ReturForm";
import { useAuth } from "@/hooks/auth";

interface TransactionActionsProps {
  transaction: {
    transaksi_id: number;
    payment_status: number;
    produk: {
      produk_id: number;
      product_name: string;
    };
    quantity: number;
  };
  onPrint: () => void;
  onWhatsApp: () => void;
  onPayDebt: () => void;
  onReturSuccess: () => void;
  onCancelTransaction: (transactionId: number) => void;
}

export const TransactionActions = ({ 
  transaction, 
  onPrint, 
  onWhatsApp, 
  onPayDebt,
  onReturSuccess,
  onCancelTransaction
}: TransactionActionsProps) => {
  const { userRole } = useAuth();
  
  // Only pelaku_usaha and admin can cancel transactions
  const canCancelTransaction = userRole === 'pelaku_usaha' || userRole === 'admin';

  return (
    <div className="flex space-x-1">
      {transaction.payment_status === 0 && (
        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={onPayDebt}
        >
          <CreditCard className="w-3 h-3 mr-1" />
          Bayar
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs px-2"
        onClick={onPrint}
      >
        <Printer className="w-3 h-3 mr-1" />
        Cetak
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs px-2"
        onClick={onWhatsApp}
      >
        <MessageSquare className="w-3 h-3 mr-1" />
        WA
      </Button>
      <ReturForm
        transactionId={transaction.transaksi_id}
        products={[{
          id: transaction.produk.produk_id,
          name: transaction.produk.product_name,
          quantity: transaction.quantity,
        }]}
        onSuccess={onReturSuccess}
      />
      
      {/* Cancel button only for authorized users */}
      {canCancelTransaction && transaction.payment_status !== 2 && (
        <Button
          variant="destructive"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={() => onCancelTransaction(transaction.transaksi_id)}
        >
          <XCircle className="w-3 h-3 mr-1" />
          Batal
        </Button>
      )}
    </div>
  );
};
