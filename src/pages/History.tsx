
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

const History = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("daily");
  const navigate = useNavigate();

  // Daily transactions query
  const { data: dailyTransactions, refetch: refetchDaily } = useQuery({
    queryKey: ["transactions", selectedDate],
    queryFn: async () => {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

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
        .gte("transaction_date", startDate.toISOString())
        .lte("transaction_date", endDate.toISOString())
        .order("payment_status", { ascending: true })
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Unpaid transactions query (accounts receivable)
  const { data: unpaidTransactions, refetch: refetchUnpaid } = useQuery({
    queryKey: ["unpaid-transactions"],
    queryFn: async () => {
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
        .eq("payment_status", 0)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
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
      console.error("Error updating payment status:", error);
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
      console.error("Error paying debt:", error);
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

        <TabsContent value="daily" className="mt-0">
          <TransactionTable
            transactions={dailyTransactions || []}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onPayDebt={handlePayDebt}
            onPrint={handlePrint}
            onWhatsApp={handleWhatsApp}
            onReturSuccess={refetchDaily}
          />
        </TabsContent>

        <TabsContent value="unpaid" className="mt-0">
          <TransactionTable
            transactions={unpaidTransactions || []}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onPayDebt={handlePayDebt}
            onPrint={handlePrint}
            onWhatsApp={handleWhatsApp}
            onReturSuccess={refetchUnpaid}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
