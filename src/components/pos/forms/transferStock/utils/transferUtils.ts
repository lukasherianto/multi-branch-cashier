
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";

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
    
    // Insert transfer header
    const { data: transferHeader, error: transferError } = await supabase
      .from("stock_transfer")
      .insert({
        cabang_id_from: parseInt(formData.cabang_id_from),
        cabang_id_to: parseInt(formData.cabang_id_to),
        pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
        status: "pending",
        total_items: transferProducts.length,
        total_quantity: transferProducts.reduce((total, p) => total + p.quantity, 0),
        notes: formData.notes || ""
      })
      .select("transfer_id")
      .single();
      
    if (transferError) {
      console.error("Error creating transfer header:", transferError);
      throw new Error("Error creating transfer: " + transferError.message);
    }
    
    console.log("Transfer header created:", transferHeader);
    
    // Insert transfer details
    const transferDetails = transferProducts.map(product => ({
      transfer_id: transferHeader.transfer_id,
      produk_id: product.produk_id,
      quantity: product.quantity,
      cabang_id_from: parseInt(formData.cabang_id_from),
      cabang_id_to: parseInt(formData.cabang_id_to)
    }));
    
    const { error: detailsError } = await supabase
      .from("stock_transfer_item")
      .insert(transferDetails);
      
    if (detailsError) {
      console.error("Error creating transfer details:", detailsError);
      throw new Error("Error creating transfer details: " + detailsError.message);
    }
    
    console.log("Transfer details created:", transferDetails);
    
    // Update stock in source branch (decrease)
    const sourceStockUpdates = transferProducts.map(async (product) => {
      const { error: updateError } = await supabase
        .from("produk")
        .update({ 
          stock: product.stock - product.quantity 
        })
        .eq("produk_id", product.produk_id)
        .eq("cabang_id", parseInt(formData.cabang_id_from));
        
      if (updateError) {
        console.error(`Error updating source stock for product ${product.produk_id}:`, updateError);
        throw new Error(`Error updating stock: ${updateError.message}`);
      }
    });
    
    await Promise.all(sourceStockUpdates);
    
    // Create or update stock in destination branch (increase)
    for (const product of transferProducts) {
      // Check if product exists in destination branch
      const { data: existingProduct, error: checkError } = await supabase
        .from("produk")
        .select("produk_id, stock")
        .eq("produk_id", product.produk_id)
        .eq("cabang_id", parseInt(formData.cabang_id_to))
        .maybeSingle();
        
      if (checkError) {
        console.error(`Error checking product in destination branch:`, checkError);
        throw new Error(`Error checking product: ${checkError.message}`);
      }
      
      if (existingProduct) {
        // Update existing product stock
        const { error: updateError } = await supabase
          .from("produk")
          .update({ 
            stock: existingProduct.stock + product.quantity 
          })
          .eq("produk_id", product.produk_id)
          .eq("cabang_id", parseInt(formData.cabang_id_to));
          
        if (updateError) {
          console.error(`Error updating destination stock:`, updateError);
          throw new Error(`Error updating destination stock: ${updateError.message}`);
        }
      } else {
        // Create a copy of the product in the destination branch
        const { data: originalProduct, error: getError } = await supabase
          .from("produk")
          .select("*")
          .eq("produk_id", product.produk_id)
          .single();
          
        if (getError) {
          console.error(`Error getting original product:`, getError);
          throw new Error(`Error getting product details: ${getError.message}`);
        }
        
        // Create new product in destination branch
        const { error: insertError } = await supabase
          .from("produk")
          .insert({
            ...originalProduct,
            produk_id: undefined, // Let DB generate new ID
            cabang_id: parseInt(formData.cabang_id_to),
            stock: product.quantity
          });
          
        if (insertError) {
          console.error(`Error creating product in destination branch:`, insertError);
          throw new Error(`Error creating product: ${insertError.message}`);
        }
      }
    }
    
    return transferHeader.transfer_id;
  } catch (error) {
    console.error("Error in executeStockTransfer:", error);
    throw error;
  }
}
