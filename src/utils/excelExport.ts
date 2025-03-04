
import * as XLSX from 'xlsx';
import { TransactionForTable } from '@/types/history';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Convert transaction data to Excel and trigger download
 */
export const exportToExcel = (
  transactions: TransactionForTable[], 
  fileName: string = 'transaction-history'
) => {
  if (!transactions || transactions.length === 0) {
    return false;
  }

  // Transform transactions into a format suitable for Excel
  const worksheetData = transactions.map(transaction => ({
    'ID Transaksi': transaction.transaksi_id,
    'Tanggal': format(new Date(transaction.transaction_date), 'dd MMM yyyy HH:mm', { locale: id }),
    'Produk': transaction.produk.product_name,
    'Jumlah': transaction.quantity,
    'Total Harga': transaction.total_price,
    'Status Pembayaran': getPaymentStatusText(transaction.payment_status),
    'Cabang': transaction.cabang.branch_name,
    'Metode Pembayaran': transaction.payment_method || '-'
  }));

  // Create a worksheet from the data
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Set column widths
  const columnWidths = [
    { wpx: 100 }, // ID Transaksi
    { wpx: 150 }, // Tanggal
    { wpx: 200 }, // Produk
    { wpx: 70 },  // Jumlah
    { wpx: 120 }, // Total Harga
    { wpx: 150 }, // Status Pembayaran
    { wpx: 150 }, // Cabang
    { wpx: 150 }  // Metode Pembayaran
  ];

  worksheet['!cols'] = columnWidths;

  // Create a workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');

  // Generate filename with date
  const dateStr = format(new Date(), 'ddMMyyyy');
  const fullFileName = `${fileName}-${dateStr}.xlsx`;

  // Write to file and trigger download
  XLSX.writeFile(workbook, fullFileName);
  
  return true;
};

/**
 * Convert payment status number to readable text
 */
function getPaymentStatusText(status: number): string {
  switch (status) {
    case 0:
      return 'Pending';
    case 1:
      return 'Completed';
    case 2:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}
