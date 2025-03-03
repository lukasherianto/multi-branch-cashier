
import { toast } from "sonner";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";

/**
 * Validates transfer data before execution
 */
export function validateTransferData(
  formData: TransferStockFormValues,
  selectedProducts: ProductWithSelection[]
): boolean {
  // Validate branch selection
  if (!formData.cabang_id_from || !formData.cabang_id_to) {
    toast.error("Pilih cabang asal dan tujuan");
    return false;
  }

  // Filter only selected products  
  const transferProducts = selectedProducts.filter(product => product.selected);
  
  // Validate product selection
  if (transferProducts.length === 0) {
    toast.error("Pilih minimal satu produk untuk ditransfer");
    return false;
  }

  return true;
}
