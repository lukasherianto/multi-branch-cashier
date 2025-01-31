import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Printer, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        console.log("Fetching transactions for pelaku usaha:", pelakuUsaha?.pelaku_usaha_id);
        
        let query = supabase
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

        // Filter by date if selected
        if (selectedDate) {
          const start = startOfDay(selectedDate).toISOString();
          const end = endOfDay(selectedDate).toISOString();
          query = query.gte('transaction_date', start).lte('transaction_date', end);
        }

        const { data, error } = await query;

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
          customer_name: null,
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
  }, [pelakuUsaha, selectedDate]);

  const handlePrint = (transaction: Transaction) => {
    navigate('/print-preview', {
      state: {
        items: [{
          id: transaction.transaksi_id,
          name: transaction.product_name,
          price: transaction.total_price / transaction.quantity,
          quantity: transaction.quantity
        }],
        total: transaction.total_price,
        businessName: pelakuUsaha?.business_name || '',
        branchName: transaction.branch_name
      }
    });
  };

  const handleWhatsApp = (transaction: Transaction) => {
    const message = `*Struk Pembayaran*\n\n` +
      `*${pelakuUsaha?.business_name || ''}*\n` +
      `${transaction.branch_name}\n\n` +
      `Tanggal: ${format(new Date(transaction.transaction_date), 'dd MMMM yyyy HH:mm', { locale: id })}\n\n` +
      `${transaction.product_name} x${transaction.quantity} = Rp ${transaction.total_price.toLocaleString('id-ID')}\n\n` +
      `*Total: Rp ${transaction.total_price.toLocaleString('id-ID')}*\n\n` +
      `Terima kasih atas kunjungan Anda!`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return <div className="p-4">Memuat data...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "dd MMMM yyyy", { locale: id })
              ) : (
                <span>Pilih tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={id}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Table>
        <TableCaption>Daftar transaksi yang telah dilakukan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Cabang</TableHead>
            <TableHead>Aksi</TableHead>
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
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePrint(transaction)}
                    title="Cetak Struk"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleWhatsApp(transaction)}
                    title="Kirim via WhatsApp"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default History;