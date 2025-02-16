
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Transaction {
  transaction_date: string;
  transaction_type: string;
  description: string;
  amount: number;
}

interface TransactionHistoryTableProps {
  transactions: Transaction[];
}

const TransactionHistoryTable = ({ transactions }: TransactionHistoryTableProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Riwayat Transaksi Kas</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell>
                {new Date(transaction.transaction_date).toLocaleDateString("id-ID")}
              </TableCell>
              <TableCell>
                {transaction.transaction_type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
              </TableCell>
              <TableCell>{transaction.description || '-'}</TableCell>
              <TableCell className="text-right">
                Rp {Number(transaction.amount).toLocaleString("id-ID")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TransactionHistoryTable;
