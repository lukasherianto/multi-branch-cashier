
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { type ProductTransfer, type TransferStockFormValues } from "../schema";

export function useTransferSubmit() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function submitTransfer(
    values: TransferStockFormValues, 
    selectedProducts: ProductTransfer[], 
    centralBranchId: string | null,
    resetForm: () => void
  ) {
    try {
      setIsSubmitting(true);

      const productsToTransfer = selectedProducts.filter(p => p.selected && p.quantity > 0);
      
      if (productsToTransfer.length === 0) {
        toast({
          title: "Error",
          description: "Pilih minimal satu produk untuk ditransfer",
          variant: "destructive",
        });
        return;
      }

      if (!centralBranchId) {
        toast({
          title: "Error",
          description: "Cabang pusat tidak terdeteksi",
          variant: "destructive",
        });
        return;
      }

      for (const product of productsToTransfer) {
        if (product.quantity > product.stock) {
          toast({
            title: "Error",
            description: `Stok ${product.product_name} tidak mencukupi`,
            variant: "destructive",
          });
          return;
        }
      }

      for (const product of productsToTransfer) {
        const { error: transferError } = await supabase
          .from('transfer_stok')
          .insert({
            produk_id: product.produk_id,
            cabang_id_from: parseInt(centralBranchId),
            cabang_id_to: parseInt(values.cabang_id_to),
            quantity: product.quantity,
          });

        if (transferError) throw transferError;

        const { error: updateError } = await supabase
          .from('produk')
          .update({ stock: product.stock - product.quantity })
          .eq('produk_id', product.produk_id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Sukses",
        description: "Transfer stok berhasil dilakukan",
      });

      resetForm();
    } catch (error) {
      console.error('Error transferring stock:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan transfer stok",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    submitTransfer
  };
}
