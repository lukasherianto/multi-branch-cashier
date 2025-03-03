
import { formatInTimeZone } from "date-fns-tz";
import { id } from "date-fns/locale";

export interface TransactionItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptData {
  items: TransactionItem[];
  total: number;
  pointsUsed: number;
  pointsEarned: number;
  businessName: string;
  branchName: string;
  customerName: string | null;
  whatsappNumber: string | null;
  paymentMethod: string | null;
  transactionId: string | null;
}

export const generateInvoiceNumber = () => {
  return `INV-${formatInTimeZone(new Date(), 'Asia/Jakarta', 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const generateReceiptHTML = (data: ReceiptData, invoiceNumber: string): string => {
  return `
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
          <div class="business-name">${data.businessName}</div>
          <div>${data.branchName}</div>
          <div class="timestamp">${formatInTimeZone(new Date(), 'Asia/Jakarta', 'dd MMMM yyyy HH:mm', { locale: id })}</div>
        </div>
        
        <div class="invoice-number">
          <strong>Invoice: ${invoiceNumber}</strong>
        </div>
        
        ${data.customerName ? `
        <div class="customer-info">
          <div><strong>Pelanggan:</strong> ${data.customerName}</div>
          ${data.whatsappNumber ? `<div><strong>WhatsApp:</strong> ${data.whatsappNumber}</div>` : ''}
        </div>
        ` : ''}
        
        <div class="items">
          ${data.items.map((item: TransactionItem) => `
            <div class="item">
              <div>${item.name} x${item.quantity}</div>
              <div>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
            </div>
          `).join('')}
        </div>
        
        ${data.pointsUsed > 0 ? `
        <div class="item" style="color: #e53935;">
          <div>Poin Digunakan</div>
          <div>- Rp ${(data.pointsUsed * 1000).toLocaleString('id-ID')}</div>
        </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <div class="total">
          <span>Total</span>
          <span>Rp ${data.total.toLocaleString('id-ID')}</span>
        </div>
        
        ${data.paymentMethod ? `
        <div class="payment-method">
          <strong>Metode Pembayaran:</strong> ${data.paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}
        </div>
        ` : ''}
        
        ${data.pointsEarned > 0 ? `
        <div class="points">
          Selamat! Anda mendapatkan ${data.pointsEarned} poin dari transaksi ini
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
};

export const generateWhatsAppMessage = (data: ReceiptData, invoiceNumber: string): string => {
  let message = `*${data.businessName}*\n` +
    `${data.branchName}\n` +
    `${formatInTimeZone(new Date(), 'Asia/Jakarta', 'dd MMMM yyyy HH:mm', { locale: id })}\n\n` +
    `*Invoice: ${invoiceNumber}*\n\n`;

  if (data.customerName) {
    message += `*Pelanggan:* ${data.customerName}\n`;
    if (data.whatsappNumber) {
      message += `*WhatsApp:* ${data.whatsappNumber}\n`;
    }
    message += '\n';
  }

  // Add items
  data.items.forEach((item: TransactionItem) => {
    message += `${item.name} x${item.quantity}: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
  });
  
  message += '\n';

  // Add points used (if any)
  if (data.pointsUsed > 0) {
    message += `Poin Digunakan: - Rp ${(data.pointsUsed * 1000).toLocaleString('id-ID')}\n\n`;
  }

  // Add total and payment method
  message += `*Total: Rp ${data.total.toLocaleString('id-ID')}*\n\n`;
  
  if (data.paymentMethod) {
    message += `Metode Pembayaran: ${data.paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}\n\n`;
  }

  // Add points earned (if any)
  if (data.pointsEarned > 0) {
    message += `Selamat! Anda mendapatkan ${data.pointsEarned} poin dari transaksi ini\n\n`;
  }

  message += 'Terima kasih atas kunjungan Anda!';

  return message;
};
