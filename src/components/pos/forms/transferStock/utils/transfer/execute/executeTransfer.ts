
import { toast } from "sonner";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";
import { updateSourceBranchStock } from "../source/updateSourceStock";
import { updateDestinationBranchStock } from "../destination/updateDestinationStock";
import { createTransferHistory } from "../history/createTransferHistory";
import { validateTransferData } from "../validation/validateTransfer";

/**
 * Main function to execute a stock transfer between branches
 * This version updates stock in source and destination branches
 * and records transfer history in the riwayat_transfer_stok table
 */
export async function executeStockTransfer(
  formData: TransferStockFormValues,
  selectedProducts: ProductWithSelection[]
): Promise<boolean> {
  try {
    console.log("Executing stock transfer with data:", formData);
    console.log("Selected products:", selectedProducts);
    
    // Validate the form data
    if (!validateTransferData(formData, selectedProducts)) {
      return false;
    }
    
    // Filter only selected products
    const transferProducts = selectedProducts.filter(product => product.selected);
    console.log("Products to transfer:", transferProducts);
    
    // Generate a transfer number (format: TRF-{timestamp})
    const transferNumber = `TRF-${Date.now()}`;
    
    // Create history entries
    await createTransferHistory(transferNumber, formData, transferProducts);
    
    // Update stock in source branch (decrease)
    await updateSourceBranchStock(
      transferProducts, 
      parseInt(formData.cabang_id_from)
    );
    
    // Create or update stock in destination branch (increase)
    await updateDestinationBranchStock(
      transferProducts, 
      parseInt(formData.cabang_id_to)
    );
    
    return true;
  } catch (error) {
    console.error("Error in executeStockTransfer:", error);
    throw error;
  }
}
