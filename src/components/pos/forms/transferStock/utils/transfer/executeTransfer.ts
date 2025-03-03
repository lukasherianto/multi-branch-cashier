
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";
import { updateSourceBranchStock } from "./sourceOperations";
import { updateDestinationBranchStock } from "./destinationOperations";
import { TransferHeaderData, TransferDetailData } from "./types";

/**
 * Main function to execute a stock transfer between branches
 */
export async function executeStockTransfer(
  formData: TransferStockFormValues,
  selectedProducts: ProductWithSelection[]
): Promise<number | null> {
  try {
    console.log("Executing stock transfer with data:", formData);
    console.log("Selected products:", selectedProducts);
    
    // Validate the form data
    if (!formData.cabang_id_from || !formData.cabang_id_to) {
      toast("Pilih cabang asal dan tujuan");
      return null;
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
      return null;
    }
    
    // Create transfer header
    const transferId = await createTransferHeader(
      formData, 
      transferProducts, 
      pelakuUsaha.pelaku_usaha_id
    );
    
    if (!transferId) {
      throw new Error("Failed to create transfer record");
    }
    
    console.log("Transfer header created with ID:", transferId);
    
    // Create transfer details
    await createTransferDetails(transferId, transferProducts);
    
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
    
    return transferId;
  } catch (error) {
    console.error("Error in executeStockTransfer:", error);
    throw error;
  }
}

/**
 * Creates the transfer header record
 */
async function createTransferHeader(
  formData: TransferStockFormValues,
  transferProducts: ProductWithSelection[],
  pelakuUsahaId: number
): Promise<number | null> {
  // We need a reference to the first product to satisfy DB schema
  const firstProduct = transferProducts[0];
  
  const headerData: TransferHeaderData = {
    cabang_id_from: parseInt(formData.cabang_id_from),
    cabang_id_to: parseInt(formData.cabang_id_to),
    pelaku_usaha_id: pelakuUsahaId,
    status: "pending",
    total_items: transferProducts.length,
    total_quantity: transferProducts.reduce((total, p) => total + p.quantity, 0),
    notes: formData.notes || "",
    // These are required by the schema but will be replaced by actual product details
    produk_id: firstProduct.produk_id || firstProduct.id,
    quantity: 1
  };
  
  const { data: headerResult, error: headerError } = await supabase
    .from("transfer_stok")
    .insert(headerData)
    .select("transfer_id")
    .single();
    
  if (headerError) {
    console.error("Error creating transfer header:", headerError);
    throw new Error("Error creating transfer: " + headerError.message);
  }
  
  return headerResult?.transfer_id || null;
}

/**
 * Creates detail records for each product in the transfer
 */
async function createTransferDetails(
  transferId: number,
  transferProducts: ProductWithSelection[]
): Promise<void> {
  for (const product of transferProducts) {
    const detailData: TransferDetailData = {
      transfer_id: transferId,
      produk_id: product.produk_id || product.id,
      quantity: product.quantity,
      retail_price: product.price || 0,
      cost_price: product.cost_price || 0
    };
    
    const { error: detailsError } = await supabase
      .from("transfer_stok_detail")
      .insert(detailData);
        
    if (detailsError) {
      console.error("Error creating transfer details:", detailsError);
      throw new Error("Error creating transfer details: " + detailsError.message);
    }
  }
  
  console.log("Transfer details created successfully");
}
