import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseReturProps {
  transactionId: number;
  onSuccess?: () => void;
}

export const useRetur = ({ transactionId, onSuccess }: UseReturProps) => {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Silakan pilih produk yang akan diretur",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current transaction data
      const { data: transaction, error: fetchError } = await supabase
        .from("transaksi")
        .select("quantity, total_price")
        .eq("transaksi_id", transactionId)
        .single();

      if (fetchError) throw fetchError;

      // Get current product stock
      const { data: product, error: productError } = await supabase
        .from("produk")
        .select("stock")
        .eq("produk_id", selectedProduct)
        .single();

      if (productError) throw productError;

      console.log('Current product stock:', product.stock);
      console.log('Return quantity:', quantity);
      
      // Calculate new values
      const newQuantity = transaction.quantity - quantity;
      const pricePerUnit = transaction.total_price / transaction.quantity;
      const newTotalPrice = newQuantity * pricePerUnit;
      const newStock = product.stock + quantity;

      console.log('New stock after return:', newStock);

      // Start transaction operations
      // 1. Insert retur record
      const { error: returError } = await supabase.from("retur").insert({
        transaksi_id: transactionId,
        produk_id: selectedProduct,
        quantity,
        reason,
      });

      if (returError) throw returError;

      // 2. Update transaction record
      const { error: updateTransactionError } = await supabase
        .from("transaksi")
        .update({
          quantity: newQuantity,
          total_price: newTotalPrice,
        })
        .eq("transaksi_id", transactionId);

      if (updateTransactionError) throw updateTransactionError;

      // 3. Update product stock
      const { error: updateStockError } = await supabase
        .from("produk")
        .update({
          stock: newStock
        })
        .eq("produk_id", selectedProduct);

      if (updateStockError) throw updateStockError;

      toast({
        title: "Sukses",
        description: "Retur berhasil dicatat dan stok diperbarui",
      });

      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating return:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat retur",
        variant: "destructive",
      });
    }
  };

  return {
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    reason,
    setReason,
    isOpen,
    setIsOpen,
    handleSubmit,
  };
};