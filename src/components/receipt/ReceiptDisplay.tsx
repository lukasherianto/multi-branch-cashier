
import React from "react";
import { formatInTimeZone } from "date-fns-tz";
import { id } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { TransactionItem } from "@/utils/receiptUtils";
import { Instagram, Facebook, Phone } from "lucide-react";

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
  logoUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  businessWhatsapp?: string | null;
  showPointsInfo?: boolean;
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
  pointsEarned,
  logoUrl,
  instagramUrl,
  facebookUrl,
  businessWhatsapp,
  showPointsInfo = true
}) => {
  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4 print:space-y-2">
        <div className="text-center">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt={businessName} 
              className="h-16 mx-auto mb-2"
              onError={(e) => {
                // Handle image loading errors
                (e.target as HTMLImageElement).style.display = 'none';
              }} 
            />
          )}
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

        {showPointsInfo && pointsUsed > 0 && (
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

        {showPointsInfo && pointsEarned > 0 && (
          <div className="text-sm text-mint-600 text-center">
            Selamat! Anda mendapatkan {pointsEarned} poin dari transaksi ini
          </div>
        )}

        <p className="text-center text-sm text-gray-500 pt-4">
          Terima kasih atas kunjungan Anda!
        </p>
        
        {/* Social Media Information */}
        {(instagramUrl || facebookUrl || businessWhatsapp) && (
          <div className="border-t pt-3 mt-3">
            <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
              {instagramUrl && (
                <div className="flex items-center gap-1">
                  <Instagram className="h-3 w-3" />
                  <span>@{instagramUrl}</span>
                </div>
              )}
              {facebookUrl && (
                <div className="flex items-center gap-1">
                  <Facebook className="h-3 w-3" />
                  <span>{facebookUrl}</span>
                </div>
              )}
              {businessWhatsapp && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{businessWhatsapp}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
