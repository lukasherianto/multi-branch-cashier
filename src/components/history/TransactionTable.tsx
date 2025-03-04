
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { TransactionStatus } from "./TransactionStatus";
import { TransactionActions } from "./TransactionActions";
import { FileX } from "lucide-react";

interface Transaction {
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
}

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdatePaymentStatus: (transactionId: number, currentStatus: number) => void;
  onPayDebt: (transactionId: number) => void;
  onPrint: (transaction: Transaction) => void;
  onWhatsApp: (transaction: Transaction) => void;
  onReturSuccess: () => void;
}

export const TransactionTable = ({
  transactions,
  onUpdatePaymentStatus,
  onPayDebt,
  onPrint,
  onWhatsApp,
  onReturSuccess,
}: TransactionTableProps) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FileX className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No transactions found</p>
          <p className="text-sm mt-2">When you make sales transactions, they will appear here.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produk
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cabang
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.transaksi_id}>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {format(new Date(transaction.transaction_date), 'dd MMM yyyy HH:mm', { locale: id })}
                </td>
                <td className="px-3 py-2 text-xs">{transaction.produk.product_name}</td>
                <td className="px-3 py-2 text-xs">{transaction.quantity}</td>
                <td className="px-3 py-2 text-xs">
                  Rp {transaction.total_price.toLocaleString('id-ID')}
                </td>
                <td className="px-3 py-2">
                  <TransactionStatus
                    status={transaction.payment_status}
                    onStatusChange={() => onUpdatePaymentStatus(transaction.transaksi_id, transaction.payment_status)}
                  />
                </td>
                <td className="px-3 py-2 text-xs">{transaction.cabang.branch_name}</td>
                <td className="px-3 py-2">
                  <TransactionActions
                    transaction={transaction}
                    onPrint={() => onPrint(transaction)}
                    onWhatsApp={() => onWhatsApp(transaction)}
                    onPayDebt={() => onPayDebt(transaction.transaksi_id)}
                    onReturSuccess={onReturSuccess}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
