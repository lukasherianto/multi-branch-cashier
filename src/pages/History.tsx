import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Transaction {
  transaksi_id: number;
  transaction_date: string;
  total_price: number;
  quantity: number;
  product_name: string;
  customer_name: string | null;
  branch_name: string;
}

const History = () => {
  const { toast } = useToast();
  const { pelakuUsaha } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        console.log("Fetching transactions for pelaku usaha:", pelakuUsaha?.pelaku_usaha_id);
        
        const { data, error } = await supabase
          .from('transaksi')
          .select(`
            transaksi_id,
            transaction_date,
            total_price,
            quantity,
            produk:produk_id(product_name),
            cabang:cabang_id(branch_name)
          `)
          .order('transaction_date', { ascending: false });

        if (error) {
          console.error("Error fetching transactions:", error);
          throw error;
        }

        console.log("Fetched transactions:", data);

        const formattedTransactions = data.map((transaction: any) => ({
          transaksi_id: transaction.transaksi_id,
          transaction_date: transaction.transaction_date,
          total_price: transaction.total_price,
          quantity: transaction.quantity,
          product_name: transaction.produk?.product_name || 'Produk tidak ditemukan',
          customer_name: null, // Sementara kosong karena belum ada relasi ke pelanggan
          branch_name: transaction.cabang?.branch_name || 'Cabang tidak ditemukan'
        }));

        setTransactions(formattedTransactions);
      } catch (error) {
        console.error("Error in fetchTransactions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data transaksi",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (pelakuUsaha) {
      fetchTransactions();
    }
  }, [pelakuUsaha]);

  if (isLoading) {
    return <div className="p-4">Memuat data...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>
      
      <Table>
        <TableCaption>Daftar transaksi yang telah dilakukan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Cabang</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.transaksi_id}>
              <TableCell>
                {format(new Date(transaction.transaction_date), 'dd MMMM yyyy HH:mm', { locale: id })}
              </TableCell>
              <TableCell>{transaction.product_name}</TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>Rp {transaction.total_price.toLocaleString('id-ID')}</TableCell>
              <TableCell>{transaction.branch_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default History;