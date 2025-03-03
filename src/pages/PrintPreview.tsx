
import { useLocation, useNavigate } from "react-router-dom";
import { ReceiptDisplay } from "@/components/receipt/ReceiptDisplay";
import { ReceiptActions } from "@/components/receipt/ReceiptActions";
import { useReceipt } from "@/hooks/useReceipt";
import { TransactionItem } from "@/utils/receiptUtils";

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
  
  // Redirect to POS page if necessary data is missing
  if (!items || !total) {
    navigate('/pos');
    return null;
  }

  // Use the receipt hook for functionality
  const receiptData = {
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
  };
  
  const { invoiceNumber, handlePrint, handleWhatsApp, handleBack } = useReceipt(receiptData);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ReceiptDisplay 
        businessName={businessName}
        branchName={branchName}
        invoiceNumber={invoiceNumber}
        customerName={customerName}
        whatsappNumber={whatsappNumber}
        items={items as TransactionItem[]}
        pointsUsed={pointsUsed}
        total={total}
        paymentMethod={paymentMethod}
        pointsEarned={pointsEarned}
      />
      
      <div className="mt-6">
        <ReceiptActions
          onPrint={handlePrint}
          onWhatsApp={handleWhatsApp}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default PrintPreview;
