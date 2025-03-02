
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PaymentHandlerProps } from "../types";
import { generateTransactionId } from "../utils/transactionUtils";
import { validateStock, updateProductStock } from "../utils/stockUtils";
import { createTransactions, createKasEntries } from "../utils/paymentUtils";

export const usePaymentHandler = ({
  cartItems,
  selectedCabangId,
  cabang,
  memberId,
  customerName,
  whatsappNumber,
  clearCart,
  fetchProducts,
  pelakuUsaha,
}: PaymentHandlerProps) => {
  const navigate = useNavigate();

  const handlePayment = async (pointsToUse: number, confirmedName?: string, confirmedWhatsapp?: string, paymentMethod: "cash" | "qris" = "cash") => {
    // Use confirmed values from order confirmation if available, otherwise use original values
    const finalCustomerName = confirmedName || customerName;
    const finalWhatsappNumber = confirmedWhatsapp || whatsappNumber;
    
    if (!cabang) {
      toast.error("Silakan pilih cabang terlebih dahulu");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Tambahkan produk ke keranjang terlebih dahulu");
      return;
    }

    if (!selectedCabangId) {
      toast.error("ID cabang tidak valid");
      return;
    }

    try {
      console.log("Starting payment process with points:", pointsToUse);
      console.log("Selected branch ID:", selectedCabangId);
      console.log("Payment method:", paymentMethod);
      
      // Generate transaction ID
      const transactionId = generateTransactionId();
      console.log("Generated transaction ID:", transactionId);
      
      // Validate stock for all items
      const isStockValid = await validateStock(cartItems);
      if (!isStockValid) return;

      // Calculate total before points
      const totalBeforePoints = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate total after points
      const finalTotal = totalBeforePoints - (pointsToUse * 1000);
      console.log("Total before points:", totalBeforePoints);
      console.log("Final total after points:", finalTotal);

      // Create transactions for each item
      await createTransactions(
        cartItems, 
        selectedCabangId, 
        memberId, 
        transactionId, 
        paymentMethod,
        totalBeforePoints,
        pointsToUse
      );

      // Update product stock
      console.log("Updating product stock for items");
      await updateProductStock(cartItems);

      // Create kas entries
      await createKasEntries(selectedCabangId, finalTotal, pointsToUse, transactionId);

      // Clear cart and refresh products
      clearCart();
      fetchProducts();
      
      console.log("Payment completed successfully, navigating to print preview");

      // Navigate to print preview
      navigate('/print-preview', {
        state: {
          items: cartItems,
          total: finalTotal,
          pointsUsed: pointsToUse,
          pointsEarned: Math.floor(finalTotal / 1000),
          businessName: pelakuUsaha?.business_name,
          branchName: cabang?.branch_name,
          customerName: finalCustomerName,
          whatsappNumber: finalWhatsappNumber,
          paymentMethod,
          transactionId // Pass the generated transaction ID
        }
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Gagal memproses pembayaran: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return { handlePayment };
};
