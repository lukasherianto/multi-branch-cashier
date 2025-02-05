
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReturForm } from "@/components/history/ReturForm";
import { Printer, MessageSquare, Ban, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const History = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const { data: transactions, refetch } = useQuery({
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
      refetch();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Gagal memperbarui status pembayaran");
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
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Riwayat Transaksi</h1>
        <Input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          className="w-auto"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cabang
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions?.map((transaction) => (
                <tr key={transaction.transaksi_id}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {format(new Date(transaction.transaction_date), 'dd MMM yyyy HH:mm', { locale: id })}
                  </td>
                  <td className="px-3 py-2 text-xs">{transaction.produk.product_name}</td>
                  <td className="px-3 py-2 text-xs">{transaction.quantity}</td>
                  <td className="px-3 py-2 text-xs">
                    Rp {transaction.total_price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => handleUpdatePaymentStatus(transaction.transaksi_id, transaction.payment_status)}
                    >
                      <Badge 
                        variant={transaction.payment_status === 1 ? "success" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {transaction.payment_status === 1 ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Lunas
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3" />
                            Hutang
                          </>
                        )}
                      </Badge>
                    </Button>
                  </td>
                  <td className="px-3 py-2 text-xs">{transaction.cabang.branch_name}</td>
                  <td className="px-3 py-2">
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handlePrint(transaction)}
                      >
                        <Printer className="w-3 h-3 mr-1" />
                        Cetak
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handleWhatsApp(transaction)}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        WA
                      </Button>
                      <ReturForm
                        transactionId={transaction.transaksi_id}
                        products={[{
                          id: transaction.produk.produk_id,
                          name: transaction.produk.product_name,
                          quantity: transaction.quantity,
                        }]}
                        onSuccess={refetch}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
