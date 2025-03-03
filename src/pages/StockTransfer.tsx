
import { TransferStockForm } from "@/components/pos/forms/transferStock";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [renderError, setRenderError] = useState<Error | null>(null);

  // Add error boundary to catch any rendering errors
  useEffect(() => {
    try {
      console.log("StockTransfer component mounted");
    } catch (err) {
      console.error("Error in StockTransfer mount:", err);
      setRenderError(err as Error);
    }
  }, []);

  // If we caught a render error, show it
  if (renderError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rendering Error</AlertTitle>
          <AlertDescription>
            {renderError.message}
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {renderError.stack}
            </pre>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  try {
    const { data: transfers = [], isLoading, error } = useQuery({
      queryKey: ['transfers'],
      queryFn: async () => {
        console.log("Starting transfer data fetch");
        try {
          const userResponse = await supabase.auth.getUser();
          console.log("Auth user response:", userResponse);
          
          if (!userResponse.data.user) {
            console.error("No authenticated user found");
            return [];
          }
          
          const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
            .from('pelaku_usaha')
            .select('pelaku_usaha_id')
            .eq('user_id', userResponse.data.user.id)
            .maybeSingle();

          if (pelakuUsahaError) {
            console.error("Error fetching pelaku usaha:", pelakuUsahaError);
            return [];
          }

          console.log("Pelaku usaha data:", pelakuUsaha);
          if (!pelakuUsaha) {
            console.log("No pelaku usaha found");
            return [];
          }

          // Fetch transfers with proper joins
          const { data: transferData, error: transferError } = await supabase
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

          if (transferError) {
            console.error('Error fetching transfers:', transferError);
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
      },
      retry: 2,
      staleTime: 30000,
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
            <AlertTriangle className="h-4 w-4" />
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
                      <TableCell>{transfer.produk?.product_name || 'Produk tidak tersedia'}</TableCell>
                      <TableCell>{transfer.cabang_from?.branch_name || 'Cabang tidak tersedia'}</TableCell>
                      <TableCell>{transfer.cabang_to?.branch_name || 'Cabang tidak tersedia'}</TableCell>
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
  } catch (error) {
    console.error("Uncaught error rendering StockTransfer:", error);
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Tak Terduga</AlertTitle>
          <AlertDescription>
            Terjadi kesalahan saat merender halaman. Silakan coba muat ulang halaman.
            {error instanceof Error && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
};

export default StockTransfer;
