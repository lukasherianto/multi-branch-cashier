
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { TransactionTable } from "@/components/history/TransactionTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/auth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface Transaction {
  transaksi_id: number;
  quantity: number;
  total_price: number;
  transaction_date: string;
  payment_status: number;
  produk: {
    produk_id: number;
    product_name: string;
  };
  cabang: {
    branch_name: string;
  };
}

const History = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("daily");
  const navigate = useNavigate();
  const { pelakuUsaha } = useAuth();

  // Query untuk transaksi harian
  const { 
    data: dailyTransactions, 
    refetch: refetchDaily, 
    isLoading: isDailyLoading, 
    isError: isDailyError 
  } = useQuery<Transaction[]>({
    queryKey: ["transactions", selectedDate, pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha?.pelaku_usaha_id) {
        return [];
      }

      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      console.log("Mengambil transaksi dari:", startDate.toISOString(), "sampai:", endDate.toISOString());
      console.log("Pelaku usaha ID:", pelakuUsaha.pelaku_usaha_id);

      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          transaksi_id,
          quantity,
          total_price,
          transaction_date,
          payment_status,
          produk:produk_id (
            produk_id,
            product_name
          ),
          cabang:cabang_id (
            branch_name
          )
        `)
        .eq("pelaku_usaha_id", pelakuUsaha.pelaku_usaha_id)
        .gte("transaction_date", startDate.toISOString())
        .lte("transaction_date", endDate.toISOString())
        .order("payment_status", { ascending: true })
        .order("transaction_date", { ascending: false });

      if (error) {
        console.error("Error saat mengambil transaksi harian:", error);
        throw error;
      }
      
      console.log("Berhasil mengambil transaksi harian:", data?.length || 0);
      return data || [];
    },
    enabled: !!pelakuUsaha?.pelaku_usaha_id
  });

  // Query untuk transaksi belum dibayar (piutang)
  const { 
    data: unpaidTransactions, 
    refetch: refetchUnpaid, 
    isLoading: isUnpaidLoading, 
    isError: isUnpaidError 
  } = useQuery<Transaction[]>({
    queryKey: ["unpaid-transactions", pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha?.pelaku_usaha_id) {
        return [];
      }

      console.log("Mengambil piutang untuk pelaku usaha ID:", pelakuUsaha.pelaku_usaha_id);

      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          transaksi_id,
          quantity,
          total_price,
          transaction_date,
          payment_status,
          produk:produk_id (
            produk_id,
            product_name
          ),
          cabang:cabang_id (
            branch_name
          )
        `)
        .eq("pelaku_usaha_id", pelakuUsaha.pelaku_usaha_id)
        .eq("payment_status", 0)
        .order("transaction_date", { ascending: false });

      if (error) {
        console.error("Error saat mengambil piutang:", error);
        throw error;
      }

      console.log("Berhasil mengambil piutang:", data?.length || 0);
      return data || [];
    },
    enabled: !!pelakuUsaha?.pelaku_usaha_id
  });

  const handleUpdatePaymentStatus = async (transactionId: number, currentStatus: number) => {
    try {
      const { error } = await supabase
        .from("transaksi")
        .update({ payment_status: currentStatus === 1 ? 0 : 1 })
        .eq("transaksi_id", transactionId);

      if (error) throw error;

      toast.success("Status pembayaran berhasil diperbarui");
      refetchDaily();
      refetchUnpaid();
    } catch (error) {
      console.error("Error saat memperbarui status pembayaran:", error);
      toast.error("Gagal memperbarui status pembayaran");
    }
  };

  const handlePayDebt = async (transactionId: number) => {
    try {
      const { error } = await supabase
        .from("transaksi")
        .update({ payment_status: 1 })
        .eq("transaksi_id", transactionId);

      if (error) throw error;

      toast.success("Pembayaran hutang berhasil");
      refetchDaily();
      refetchUnpaid();
    } catch (error) {
      console.error("Error saat membayar hutang:", error);
      toast.error("Gagal melakukan pembayaran hutang");
    }
  };

  const handlePrint = (transaction: any) => {
    const items = [{
      id: transaction.produk.produk_id,
      name: transaction.produk.product_name,
      quantity: transaction.quantity,
      price: transaction.total_price / transaction.quantity,
    }];

    navigate("/print-preview", {
      state: {
        items,
        total: transaction.total_price,
        branchName: transaction.cabang.branch_name,
      },
    });
  };

  const handleWhatsApp = (transaction: any) => {
    const message = `*Struk Pembayaran*\n\n` +
      `*${transaction.cabang.branch_name}*\n\n` +
      `Tanggal: ${format(new Date(transaction.transaction_date), 'dd MMMM yyyy HH:mm', { locale: id })}\n\n` +
      `${transaction.produk.product_name} x${transaction.quantity} = Rp ${transaction.total_price.toLocaleString('id-ID')}\n\n` +
      `*Total: Rp ${transaction.total_price.toLocaleString('id-ID')}*\n` +
      `Status: ${transaction.payment_status === 1 ? 'Lunas' : 'Belum Lunas'}\n\n` +
      `Terima kasih atas kunjungan Anda!`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }
  };

  if (!pelakuUsaha) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Riwayat Transaksi</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Perhatian</AlertTitle>
          <AlertDescription>
            Silakan lengkapi profil usaha Anda terlebih dahulu di halaman Pengaturan.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLoading = activeTab === "daily" ? isDailyLoading : isUnpaidLoading;
  const isError = activeTab === "daily" ? isDailyError : isUnpaidError;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="daily" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Riwayat Transaksi</h1>
            <TabsList>
              <TabsTrigger value="daily">Transaksi Harian</TabsTrigger>
              <TabsTrigger value="unpaid">Piutang</TabsTrigger>
            </TabsList>
          </div>
          {activeTab === "daily" && (
            <Input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="w-auto"
            />
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-mint-600" />
            <span className="ml-2">Memuat data transaksi...</span>
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Gagal memuat data transaksi. Silakan coba lagi nanti.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && (
          <>
            <TabsContent value="daily" className="mt-0">
              {dailyTransactions && dailyTransactions.length > 0 ? (
                <TransactionTable
                  transactions={dailyTransactions}
                  onUpdatePaymentStatus={handleUpdatePaymentStatus}
                  onPayDebt={handlePayDebt}
                  onPrint={handlePrint}
                  onWhatsApp={handleWhatsApp}
                  onReturSuccess={refetchDaily}
                />
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                  Tidak ada transaksi pada tanggal {format(selectedDate, 'dd MMMM yyyy', { locale: id })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unpaid" className="mt-0">
              {unpaidTransactions && unpaidTransactions.length > 0 ? (
                <TransactionTable
                  transactions={unpaidTransactions}
                  onUpdatePaymentStatus={handleUpdatePaymentStatus}
                  onPayDebt={handlePayDebt}
                  onPrint={handlePrint}
                  onWhatsApp={handleWhatsApp}
                  onReturSuccess={refetchUnpaid}
                />
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                  Tidak ada piutang yang ditemukan
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default History;
