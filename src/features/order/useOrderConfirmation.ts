
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { validateMemberId } from "@/components/order/CustomerValidator";

interface OrderConfirmationParams {
  handlePayment: (
    pointsToUse: number,
    customerName: string,
    whatsappNumber: string,
    paymentMethod: "cash" | "qris"
  ) => Promise<void>;
  isRegisteredCustomer: boolean;
  memberId: number | null;
  pointsToUse: number;
  customerName: string;
  whatsappNumber: string;
}

export const useOrderConfirmation = ({
  handlePayment,
  isRegisteredCustomer,
  memberId,
  pointsToUse,
  customerName,
  whatsappNumber
}: OrderConfirmationParams) => {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      console.log("Payment confirmation started:", {
        isRegisteredCustomer,
        memberId,
        paymentMethod
      });
      
      if (isRegisteredCustomer && memberId) {
        const isValidMember = await validateMemberId(memberId);
        if (!isValidMember) {
          console.error("Invalid pelanggan ID:", memberId);
          toast.error("Data pelanggan tidak valid. Silakan periksa kembali pelanggan.");
          setErrorMessage("Data pelanggan tidak valid. Silakan kembali ke POS dan pilih pelanggan yang valid.");
          setIsProcessing(false);
          return;
        }
      }
      
      // Pass the payment method to the handlePayment function
      await handlePayment(pointsToUse || 0, customerName, whatsappNumber, paymentMethod);
      // Navigation to print-preview is handled inside handlePayment
    } catch (error) {
      console.error("Payment error:", error);
      
      let message = "Gagal memproses pembayaran";
      if (error instanceof Error) {
        if (error.message.includes("violates foreign key constraint")) {
          message = "Data pelanggan tidak valid. Pastikan pelanggan sudah terdaftar.";
        } else if (error.message.includes("Failed to process")) {
          message = "Gagal memproses transaksi. Silakan coba lagi atau hubungi admin.";
        } else {
          message = `Error: ${error.message}`;
        }
      }
      
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    errorMessage,
    handleConfirmPayment
  };
};
