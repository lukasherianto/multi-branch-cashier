
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
    paymentMethod,
    transactionId
  } = location.state || {};
  
  // Generate a random invoice number with format INV-YYYYMMDD-XXXX if not provided
  const invoiceNumber = transactionId || `INV-${formatInTimeZone(new Date(), 'Asia/Jakarta', 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const handlePrint = () => {
    // Create a new window with only the invoice content
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print the receipt.');
      return;
    }
    
    // Generate the receipt content
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${invoiceNumber}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 10px;
            font-size: 10px;
            width: 80mm; /* Thermal receipt width */
          }
          .receipt {
            width: 100%;
            max-width: 80mm;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
          }
          .business-name {
            font-size: 14px;
            font-weight: bold;
          }
          .invoice-number {
            background-color: #f8f8f8;
            padding: 3px;
            margin: 6px 0;
            text-align: center;
          }
          .customer-info {
            margin: 6px 0;
          }
          .items {
            border-top: 1px dashed #ddd;
            border-bottom: 1px dashed #ddd;
            padding: 5px 0;
            margin: 5px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .total {
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 9px;
            color: #666;
          }
          .payment-method {
            text-align: center;
            margin: 5px 0;
          }
          .points {
            text-align: center;
            margin: 5px 0;
            color: #4caf50;
          }
          .divider {
            border-bottom: 1px dashed #ddd;
            margin: 5px 0;
          }
          .timestamp {
            font-size: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="business-name">${businessName}</div>
            <div>${branchName}</div>
            <div class="timestamp">${formatInTimeZone(new Date(), 'Asia/Jakarta', 'dd MMMM yyyy HH:mm', { locale: id })}</div>
          </div>
          
          <div class="invoice-number">
            <strong>Invoice: ${invoiceNumber}</strong>
          </div>
          
          ${customerName ? `
          <div class="customer-info">
            <div><strong>Pelanggan:</strong> ${customerName}</div>
            ${whatsappNumber ? `<div><strong>WhatsApp:</strong> ${whatsappNumber}</div>` : ''}
          </div>
          ` : ''}
          
          <div class="items">
            ${items.map((item: TransactionItem) => `
              <div class="item">
                <div>${item.name} x${item.quantity}</div>
                <div>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
              </div>
            `).join('')}
          </div>
          
          ${pointsUsed > 0 ? `
          <div class="item" style="color: #e53935;">
            <div>Poin Digunakan</div>
            <div>- Rp ${(pointsUsed * 1000).toLocaleString('id-ID')}</div>
          </div>
          ` : ''}
          
          <div class="divider"></div>
          
          <div class="total">
            <span>Total</span>
            <span>Rp ${total.toLocaleString('id-ID')}</span>
          </div>
          
          ${paymentMethod ? `
          <div class="payment-method">
            <strong>Metode Pembayaran:</strong> ${paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}
          </div>
          ` : ''}
          
          ${pointsEarned > 0 ? `
          <div class="points">
            Selamat! Anda mendapatkan ${pointsEarned} poin dari transaksi ini
          </div>
          ` : ''}
          
          <div class="divider"></div>
          
          <div class="footer">
            Terima kasih atas kunjungan Anda!
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const handleWhatsApp = () => {
    // Generate the same content as the printed receipt but in plain text format
    let message = `*${businessName}*\n` +
      `${branchName}\n` +
      `${formatInTimeZone(new Date(), 'Asia/Jakarta', 'dd MMMM yyyy HH:mm', { locale: id })}\n\n` +
      `*Invoice: ${invoiceNumber}*\n\n`;

    if (customerName) {
      message += `*Pelanggan:* ${customerName}\n`;
      if (whatsappNumber) {
        message += `*WhatsApp:* ${whatsappNumber}\n`;
      }
      message += '\n';
    }

    // Add items
    items.forEach((item: TransactionItem) => {
      message += `${item.name} x${item.quantity}: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
    });
    
    message += '\n';

    // Add points used (if any)
    if (pointsUsed > 0) {
      message += `Poin Digunakan: - Rp ${(pointsUsed * 1000).toLocaleString('id-ID')}\n\n`;
    }

    // Add total and payment method
    message += `*Total: Rp ${total.toLocaleString('id-ID')}*\n\n`;
    
    if (paymentMethod) {
      message += `Metode Pembayaran: ${paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}\n\n`;
    }

    // Add points earned (if any)
    if (pointsEarned > 0) {
      message += `Selamat! Anda mendapatkan ${pointsEarned} poin dari transaksi ini\n\n`;
    }

    message += 'Terima kasih atas kunjungan Anda!';

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
            Cetak Struk
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
