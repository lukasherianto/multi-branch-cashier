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
      // Start a Supabase transaction
      const { data: transaction, error: fetchError } = await supabase
        .from("transaksi")
        .select("quantity, total_price")
        .eq("transaksi_id", transactionId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new values
      const newQuantity = transaction.quantity - quantity;
      const pricePerUnit = transaction.total_price / transaction.quantity;
      const newTotalPrice = newQuantity * pricePerUnit;

      // Insert retur record
      const { error: returError } = await supabase.from("retur").insert({
        transaksi_id: transactionId,
        produk_id: selectedProduct,
        quantity,
        reason,
      });

      if (returError) throw returError;

      // Update transaction record
      const { error: updateError } = await supabase
        .from("transaksi")
        .update({
          quantity: newQuantity,
          total_price: newTotalPrice,
        })
        .eq("transaksi_id", transactionId);

      if (updateError) throw updateError;

      toast({
        title: "Sukses",
        description: "Retur berhasil dicatat",
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