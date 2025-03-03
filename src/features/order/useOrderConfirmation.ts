
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { validateMemberId } from "@/components/order/CustomerValidator";
import { supabase } from "@/integrations/supabase/client";

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
  pelakuUsahaId?: number;
}

export const useOrderConfirmation = ({
  handlePayment,
  isRegisteredCustomer,
  memberId,
  pointsToUse,
  customerName,
  whatsappNumber,
  pelakuUsahaId
}: OrderConfirmationParams) => {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pointsEnabled, setPointsEnabled] = useState(true);

  useEffect(() => {
    if (pelakuUsahaId) {
      fetchPointsSettings();
    }
  }, [pelakuUsahaId]);

  const fetchPointsSettings = async () => {
    try {
      if (!pelakuUsahaId) return;

      const { data, error } = await supabase
        .from('pelaku_usaha')
        .select('points_enabled')
        .eq('pelaku_usaha_id', pelakuUsahaId)
        .single();

      if (error) {
        console.error("Error fetching points settings:", error);
        return;
      }

      setPointsEnabled(data?.points_enabled || false);
    } catch (error) {
      console.error("Error in fetchPointsSettings:", error);
    }
  };
  
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
      // If points are not enabled, don't use any points
      const actualPointsToUse = pointsEnabled ? (pointsToUse || 0) : 0;
      await handlePayment(actualPointsToUse, customerName, whatsappNumber, paymentMethod);
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
    handleConfirmPayment,
    pointsEnabled
  };
};
