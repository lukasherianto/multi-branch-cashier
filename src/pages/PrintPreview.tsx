
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, MessageSquare, ArrowLeft } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { id } from "date-fns/locale";

interface TransactionItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const PrintPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    items, 
    total, 
    pointsUsed, 
    pointsEarned, 
    businessName, 
    branchName,
    customerName,
    whatsappNumber,
    paymentMethod
  } = location.state || {};
  
  // Generate a random invoice number with format INV-YYYYMMDD-XXXX
  const invoiceNumber = `INV-${formatInTimeZone(new Date(), 'Asia/Jakarta', 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const itemsList = items.map((item: TransactionItem) => 
      `${item.name} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`
    ).join('\n');

    let message = `*Invoice ${invoiceNumber}*\n\n` +
      `*${businessName}*\n` +
      `${branchName}\n\n` +
      `Pelanggan: ${customerName}\n` +
      `WhatsApp: ${whatsappNumber}\n\n` +
      `Tanggal: ${formatInTimeZone(new Date(), 'Asia/Jakarta', 'dd MMMM yyyy HH:mm', { locale: id })}\n\n` +
      `${itemsList}\n\n`;

    if (pointsUsed > 0) {
      message += `Poin Digunakan: ${pointsUsed} (Rp ${(pointsUsed * 1000).toLocaleString('id-ID')})\n`;
    }

    message += `*Total: Rp ${total.toLocaleString('id-ID')}*\n`;
    
    if (paymentMethod) {
      message += `Metode Pembayaran: ${paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}\n`;
    }

    if (pointsEarned > 0) {
      message += `\nPoin Diperoleh: ${pointsEarned}\n`;
    }

    message += `\nTerima kasih atas kunjungan Anda!`;

    // Use the provided WhatsApp number if available, otherwise open without a number
    const whatsappUrl = whatsappNumber 
      ? `https://wa.me/${whatsappNumber.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
      
    window.open(whatsappUrl, '_blank');
  };

  if (!items || !total) {
    navigate('/pos');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
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

        <div className="flex gap-4 justify-center print:hidden">
          <Button onClick={handlePrint} className="w-40">
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button onClick={handleWhatsApp} className="w-40">
            <MessageSquare className="mr-2 h-4 w-4" />
            Kirim WhatsApp
          </Button>
        </div>
        
        <div className="print:hidden text-center mt-4">
          <Button variant="outline" onClick={() => navigate("/pos")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke POS
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PrintPreview;
