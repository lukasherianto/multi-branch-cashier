
import React from "react";
import { formatInTimeZone } from "date-fns-tz";
import { id } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { TransactionItem } from "@/utils/receiptUtils";

interface ReceiptDisplayProps {
  businessName: string;
  branchName: string;
  invoiceNumber: string;
  customerName: string | null;
  whatsappNumber: string | null;
  items: TransactionItem[];
  pointsUsed: number;
  total: number;
  paymentMethod: string | null;
  pointsEarned: number;
}

export const ReceiptDisplay: React.FC<ReceiptDisplayProps> = ({
  businessName,
  branchName,
  invoiceNumber,
  customerName,
  whatsappNumber,
  items,
  pointsUsed,
  total,
  paymentMethod,
  pointsEarned
}) => {
  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4 print:space-y-2">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{businessName}</h1>
          <p className="text-gray-600">{branchName}</p>
          <p className="text-sm text-gray-500">
            {formatInTimeZone(new Date(), 'Asia/Jakarta', 'dd MMMM yyyy HH:mm', { locale: id })}
          </p>
          <div className="my-3 p-2 bg-gray-50 rounded-md">
            <p className="font-bold">Invoice: {invoiceNumber}</p>
          </div>
        </div>

        {customerName && (
          <div className="text-sm">
            <p><strong>Pelanggan:</strong> {customerName}</p>
            {whatsappNumber && <p><strong>WhatsApp:</strong> {whatsappNumber}</p>}
          </div>
        )}

        <div className="border-t border-b py-4 space-y-2">
          {items.map((item: TransactionItem) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <span>{item.name}</span>
                <span className="text-gray-500 ml-2">x{item.quantity}</span>
              </div>
              <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>

        {pointsUsed > 0 && (
          <div className="flex justify-between text-sm text-red-500">
            <span>Poin Digunakan</span>
            <span>- Rp {(pointsUsed * 1000).toLocaleString('id-ID')}</span>
          </div>
        )}

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>

        {paymentMethod && (
          <div className="text-sm text-center">
            <p><strong>Metode Pembayaran:</strong> {paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}</p>
          </div>
        )}

        {pointsEarned > 0 && (
          <div className="text-sm text-mint-600 text-center">
            Selamat! Anda mendapatkan {pointsEarned} poin dari transaksi ini
          </div>
        )}

        <p className="text-center text-sm text-gray-500 pt-4">
          Terima kasih atas kunjungan Anda!
        </p>
      </div>
    </Card>
  );
};
