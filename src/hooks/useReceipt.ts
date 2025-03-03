
import { useNavigate } from "react-router-dom";
import { 
  ReceiptData, 
  generateInvoiceNumber, 
  generateReceiptHTML,
  generateWhatsAppMessage
} from "@/utils/receiptUtils";

export const useReceipt = (receiptData: ReceiptData) => {
  const navigate = useNavigate();
  
  // Generate invoice number if not provided
  const invoiceNumber = receiptData.transactionId || generateInvoiceNumber();
  
  const handlePrint = () => {
    // Create a new window with only the invoice content
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print the receipt.');
      return;
    }
    
    // Generate the receipt content
    const receiptContent = generateReceiptHTML(receiptData, invoiceNumber);
    
    printWindow.document.open();
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  const handleWhatsApp = () => {
    // Generate WhatsApp message
    const message = generateWhatsAppMessage(receiptData, invoiceNumber);

    // Use the provided WhatsApp number if available, otherwise open without a number
    const whatsappUrl = receiptData.whatsappNumber 
      ? `https://wa.me/${receiptData.whatsappNumber.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
      
    window.open(whatsappUrl, '_blank');
  };

  const handleBack = () => {
    navigate('/pos');
  };

  return {
    invoiceNumber,
    handlePrint,
    handleWhatsApp,
    handleBack
  };
};
