
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";
import { updateSourceBranchStock } from "./sourceOperations";
import { updateDestinationBranchStock } from "./destinationOperations";
import { TransferHeaderData } from "./types";

/**
 * Main function to execute a stock transfer between branches
 * This version directly updates stock in source and destination branches
 * without storing transfer records (since tables were removed)
 */
export async function executeStockTransfer(
  formData: TransferStockFormValues,
  selectedProducts: ProductWithSelection[]
): Promise<boolean> {
  try {
    console.log("Executing direct stock transfer with data:", formData);
    console.log("Selected products:", selectedProducts);
    
    // Validate the form data
    if (!formData.cabang_id_from || !formData.cabang_id_to) {
      toast("Pilih cabang asal dan tujuan");
      return false;
    }

    // Get current user's pelaku_usaha_id
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error("Error getting user data");
    }
    
    const { data: pelakuUsaha, error: pelakulError } = await supabase
      .from("pelaku_usaha")
      .select("pelaku_usaha_id")
      .eq("user_id", userData.user.id)
      .single();
      
    if (pelakulError) {
      console.error("Error getting pelaku usaha:", pelakulError);
      throw new Error("Error getting business data");
    }
    
    // Filter only selected products
    const transferProducts = selectedProducts.filter(product => product.selected);
    console.log("Products to transfer:", transferProducts);
    
    if (transferProducts.length === 0) {
      toast("Pilih minimal satu produk untuk ditransfer");
      return false;
    }
    
    // Create log entry in console (we're not storing in DB anymore)
    logTransferData(
      formData, 
      transferProducts, 
      pelakuUsaha.pelaku_usaha_id
    );
    
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

/**
 * Log transfer data to console (replacement for DB storage)
 */
function logTransferData(
  formData: TransferStockFormValues,
  transferProducts: ProductWithSelection[],
  pelakuUsahaId: number
): void {
  // Create a header data object for logging
  const headerData: TransferHeaderData = {
    cabang_id_from: parseInt(formData.cabang_id_from),
    cabang_id_to: parseInt(formData.cabang_id_to),
    pelaku_usaha_id: pelakuUsahaId,
    status: "completed",
    total_items: transferProducts.length,
    total_quantity: transferProducts.reduce((total, p) => total + p.quantity, 0),
    notes: formData.notes || ""
  };
  
  console.log("Transfer data:", {
    header: headerData,
    details: transferProducts.map(product => ({
      produk_id: product.produk_id || product.id,
      quantity: product.quantity,
      retail_price: product.price || 0,
      cost_price: product.cost_price || 0
    }))
  });
}
