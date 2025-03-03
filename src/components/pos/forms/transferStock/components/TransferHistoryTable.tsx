
import { format } from "date-fns";
import { ArrowDownUp } from "lucide-react";
import { TransferHistoryItem } from "../hooks/useTransferHistory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TransferHistoryTableProps {
  transfers: TransferHistoryItem[];
}

const TransferHistoryTable = ({ transfers }: TransferHistoryTableProps) => {
  if (transfers.length === 0) {
    return (
      <div className="text-center py-8">
        <ArrowDownUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Tidak ada riwayat transfer</h3>
        <p className="text-sm text-muted-foreground">
          Riwayat transfer akan ditampilkan di sini setelah Anda melakukan transfer.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Transfer</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Dari</TableHead>
            <TableHead>Ke</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((transfer) => (
            <TableRow key={transfer.transfer_id}>
              <TableCell className="font-medium">{transfer.nomor_transfer}</TableCell>
              <TableCell>
                {format(new Date(transfer.transfer_date), 'dd/MM/yyyy HH:mm')}
              </TableCell>
              <TableCell>{transfer.from_branch_name}</TableCell>
              <TableCell>{transfer.to_branch_name}</TableCell>
              <TableCell>{transfer.product_name}</TableCell>
              <TableCell className="text-right">{transfer.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransferHistoryTable;
