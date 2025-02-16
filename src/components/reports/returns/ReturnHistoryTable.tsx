
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Return {
  retur_id: number;
  retur_date: string;
  quantity: number;
  reason: string;
  produk: {
    product_name: string;
  };
}

interface ReturnHistoryTableProps {
  returns: Return[];
}

const ReturnHistoryTable = ({ returns }: ReturnHistoryTableProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Riwayat Retur</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Alasan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.map((retur) => (
            <TableRow key={retur.retur_id}>
              <TableCell>
                {new Date(retur.retur_date).toLocaleDateString("id-ID")}
              </TableCell>
              <TableCell>{retur.produk.product_name}</TableCell>
              <TableCell>{retur.quantity}</TableCell>
              <TableCell>{retur.reason || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ReturnHistoryTable;
