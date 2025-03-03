
import React from "react";
import { format } from "date-fns";
import { id } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Transfer } from "../hooks/useTransferHistory";

interface TransferHistoryTableProps {
  transfers: Transfer[];
  branchFilter: string;
}

const TransferHistoryTable = ({ transfers, branchFilter }: TransferHistoryTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Transfer</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Dari</TableHead>
            <TableHead>Ke</TableHead>
            <TableHead>Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers && transfers.length > 0 ? (
            transfers.map((transfer) => (
              <TableRow key={transfer.transfer_id}>
                <TableCell>{transfer.batch_number}</TableCell>
                <TableCell>
                  {format(new Date(transfer.transfer_date), 'PPpp', { locale: id })}
                </TableCell>
                <TableCell>{transfer.produk?.product_name || 'Produk tidak tersedia'}</TableCell>
                <TableCell>{transfer.cabang_from?.branch_name || 'Cabang tidak tersedia'}</TableCell>
                <TableCell>{transfer.cabang_to?.branch_name || 'Cabang tidak tersedia'}</TableCell>
                <TableCell>{transfer.quantity}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                {branchFilter !== "all" 
                  ? `Belum ada riwayat transfer untuk cabang ${branchFilter}`
                  : "Belum ada riwayat transfer"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransferHistoryTable;
