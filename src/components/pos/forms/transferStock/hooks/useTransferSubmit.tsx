
import { useState } from "react";
import { toast } from "sonner";
import { executeStockTransfer } from "../utils/transfer";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";

export const useTransferSubmit = (
  form: any,
  filteredProducts: ProductWithSelection[],
  centralBranch: any,
  fromCentralToBranch: boolean
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const onSubmit = async (data: TransferStockFormValues) => {
    try {
      setIsSubmitting(true);
      
      const productsToTransfer = filteredProducts.filter(p => p.selected);
      
      if (productsToTransfer.length === 0) {
        toast("Pilih minimal satu produk untuk ditransfer");
        return;
      }

      console.log("Submitting transfer with data:", data);
      console.log("Selected products:", productsToTransfer);

      // Execute transfer operation
      const success = await executeStockTransfer(data, productsToTransfer);
      
      if (success) {
        toast(`Transfer stok berhasil dilakukan`);
        
        // Reset form and selection
        form.reset();
        
        // If direction is from central to branch, auto-select central again
        if (fromCentralToBranch && centralBranch) {
          form.setValue('cabang_id_from', centralBranch.cabang_id.toString());
        }
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    onSubmit
  };
};
