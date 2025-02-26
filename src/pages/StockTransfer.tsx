
import { TransferStockForm } from "@/components/pos/forms/TransferStockForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from 'date-fns/locale';

interface Transfer {
  transfer_id: number;
  transfer_date: string;
  quantity: number;
  produk: {
    product_name: string;
  } | null;
  cabang_from: {
    branch_name: string;
  } | null;
  cabang_to: {
    branch_name: string;
  } | null;
}

const StockTransfer = () => {
  // Fetch transfer history
  const { data: transfers = [] } = useQuery<Transfer[]>({
    queryKey: ['transfers'],
    queryFn: async () => {
      const { data: pelakuUsaha } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!pelakuUsaha) return [];

      const { data } = await supabase
        .from('transfer_stok')
        .select(`
          transfer_id,
          transfer_date,
          quantity,
          produk:produk_id(product_name),
          cabang_from:cabang_id_from(branch_name),
          cabang_to:cabang_id_to(branch_name)
        `)
        .order('transfer_date', { ascending: false });

      return data || [];
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Transfer Stok</h2>
        <p className="text-gray-600 mt-2">Transfer stok antar cabang</p>
      </div>

      <TransferStockForm />

      <div>
        <h3 className="text-lg font-semibold mb-4">Riwayat Transfer</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Dari</TableHead>
                <TableHead>Ke</TableHead>
                <TableHead>Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length > 0 ? (
                transfers.map((transfer) => (
                  <TableRow key={transfer.transfer_id}>
                    <TableCell>
                      {format(new Date(transfer.transfer_date), 'PPpp', { locale: id })}
                    </TableCell>
                    <TableCell>{transfer.produk?.product_name}</TableCell>
                    <TableCell>{transfer.cabang_from?.branch_name}</TableCell>
                    <TableCell>{transfer.cabang_to?.branch_name}</TableCell>
                    <TableCell>{transfer.quantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada riwayat transfer
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default StockTransfer;
