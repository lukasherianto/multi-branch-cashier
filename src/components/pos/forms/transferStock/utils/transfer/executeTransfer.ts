
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";
import { updateSourceBranchStock } from "./sourceOperations";
import { updateDestinationBranchStock } from "./destinationOperations";
import { TransferHeaderData } from "./types";

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
    
    // Generate a transfer number (format: TRF-{timestamp})
    const transferNumber = `TRF-${Date.now()}`;
    
    // Create history entries
    const historyEntries = transferProducts.map(product => ({
      nomor_transfer: transferNumber,
      produk_id: product.produk_id || product.id,
      nama_produk: product.name,
      jumlah_produk: product.quantity,
      harga_satuan: product.price || 0,
      satuan: product.unit || 'Pcs',
      total_harga: (product.price || 0) * product.quantity,
      cabang_id_from: parseInt(formData.cabang_id_from),
      cabang_id_to: parseInt(formData.cabang_id_to)
    }));
    
    // Save history to database
    const { error: historyError } = await supabase
      .from('riwayat_transfer_stok')
      .insert(historyEntries);
      
    if (historyError) {
      console.error("Error saving transfer history:", historyError);
      throw new Error("Error saving transfer history");
    }
    
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
