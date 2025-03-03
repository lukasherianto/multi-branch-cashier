
import { TransferStockForm } from "@/components/pos/forms/transferStock";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useEffect } from "react";

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
  // Add a useEffect to log when component mounts
  useEffect(() => {
    console.log("StockTransfer component mounted");
  }, []);

  const { data: transfers = [], isLoading, error } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      console.log("Starting transfer data fetch");
      try {
        const { data: pelakuUsaha } = await supabase
          .from('pelaku_usaha')
          .select('pelaku_usaha_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        console.log("Pelaku usaha data:", pelakuUsaha);
        if (!pelakuUsaha) {
          console.log("No pelaku usaha found");
          return [];
        }

        // Fetch transfers with proper joins
        const { data: transferData, error } = await supabase
          .from('transfer_stok')
          .select(`
            transfer_id,
            transfer_date,
            quantity,
            produk:produk_id (
              product_name
            ),
            cabang_from:cabang!cabang_id_from (
              branch_name
            ),
            cabang_to:cabang!cabang_id_to (
              branch_name
            )
          `)
          .order('transfer_date', { ascending: false });

        if (error) {
          console.error('Error fetching transfers:', error);
          return [];
        }

        console.log("Transfer data fetched:", transferData);

        // Transform the data to match the Transfer interface
        const formattedTransfers: Transfer[] = (transferData || []).map(transfer => ({
          transfer_id: transfer.transfer_id,
          transfer_date: transfer.transfer_date,
          quantity: transfer.quantity,
          produk: transfer.produk,
          cabang_from: {
            branch_name: transfer.cabang_from?.branch_name || 'Unknown'
          },
          cabang_to: {
            branch_name: transfer.cabang_to?.branch_name || 'Unknown'
          }
        }));

        return formattedTransfers;
      } catch (error) {
        console.error('Error in transfer query:', error);
        return [];
      }
    }
  });

  // Enhanced loading state with more visible UI
  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg">Memuat data transfer stok...</p>
      </div>
    );
  }
  
  // Enhanced error state display
  if (error) {
    console.error("Error in transfers query:", error);
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal memuat data transfer stok. Silakan coba lagi nanti.
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log("Rendering StockTransfer component with transfers:", transfers);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Transfer Stok</h2>
        <p className="text-gray-600 mt-2">Transfer stok dari pusat ke cabang</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Produk hanya dapat diinput di pusat. Cabang hanya dapat menerima produk melalui transfer stok dari pusat.
        </AlertDescription>
      </Alert>

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
              {transfers && transfers.length > 0 ? (
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
