import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ReturForm } from "@/components/history/ReturForm";
import { Printer, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
      `*Total: Rp ${transaction.total_price.toLocaleString('id-ID')}*\n\n` +
      `Terima kasih atas kunjungan Anda!`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cabang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions?.map((transaction) => (
                <tr key={transaction.transaksi_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(transaction.transaction_date), 'dd MMM yyyy HH:mm', { locale: id })}
                  </td>
                  <td className="px-6 py-4">{transaction.produk.product_name}</td>
                  <td className="px-6 py-4">{transaction.quantity}</td>
                  <td className="px-6 py-4">
                    Rp {transaction.total_price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">{transaction.cabang.branch_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(transaction)}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Cetak
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWhatsApp(transaction)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
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