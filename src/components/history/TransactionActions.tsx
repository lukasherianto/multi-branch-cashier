
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare, CreditCard } from "lucide-react";
import { ReturForm } from "@/components/history/ReturForm";

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
}

export const TransactionActions = ({ 
  transaction, 
  onPrint, 
  onWhatsApp, 
  onPayDebt,
  onReturSuccess 
}: TransactionActionsProps) => {
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
    </div>
  );
};
