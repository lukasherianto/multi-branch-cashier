
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { type ProductTransfer, type TransferToBranchFormValues } from "./schema";

export function useTransferToBranchSubmit() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function submitTransfer(
    values: TransferToBranchFormValues, 
    selectedProducts: ProductTransfer[], 
    sourceBranchId: string,
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

      if (!sourceBranchId) {
        toast({
          title: "Error",
          description: "Cabang pusat tidak terdeteksi",
          variant: "destructive",
        });
        return;
      }

      if (!values.cabang_id_to) {
        toast({
          title: "Error",
          description: "Cabang tujuan tidak terdeteksi",
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

      console.log("Processing central-to-branch transfer:");
      console.log("Source branch ID (central):", sourceBranchId);
      console.log("Destination branch ID:", values.cabang_id_to);
      console.log("Products to transfer:", productsToTransfer);

      // Calculate total cost price for reporting
      const totalCostPrice = productsToTransfer.reduce(
        (sum, product) => sum + (product.cost_price * product.quantity), 
        0
      );
      console.log("Total cost price of transferred products:", totalCostPrice);

      for (const product of productsToTransfer) {
        // Create the transfer record
        const { error: transferError } = await supabase
          .from('transfer_stok')
          .insert({
            produk_id: product.produk_id,
            cabang_id_from: parseInt(sourceBranchId),
            cabang_id_to: parseInt(values.cabang_id_to),
            quantity: product.quantity,
          });

        if (transferError) {
          console.error("Transfer insertion error:", transferError);
          throw transferError;
        }

        // Update the stock in the source branch (central)
        const { error: updateError } = await supabase
          .from('produk')
          .update({ stock: product.stock - product.quantity })
          .eq('produk_id', product.produk_id);

        if (updateError) {
          console.error("Stock update error:", updateError);
          throw updateError;
        }
      }

      toast({
        title: "Sukses",
        description: `Transfer ${productsToTransfer.length} produk ke cabang berhasil dilakukan`,
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
