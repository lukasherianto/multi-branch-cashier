
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection } from "@/types/pos";
import { toast } from "sonner";

/**
 * Creates or updates product stock in the destination branch
 */
export async function updateDestinationBranchStock(
  products: ProductWithSelection[],
  destinationBranchId: number
): Promise<void> {
  try {
    console.log(`Updating destination branch (${destinationBranchId}) stock for ${products.length} products`);
    
    for (const product of products) {
      // Check if product exists in destination branch
      const { data: existingProduct, error: checkError } = await supabase
        .from("produk")
        .select("produk_id, stock")
        .eq("barcode", product.barcode)
        .eq("cabang_id", destinationBranchId)
        .maybeSingle();
        
      if (checkError) {
        console.error(`Error checking product in destination branch:`, checkError);
        throw new Error(`Error checking product: ${checkError.message}`);
      }
      
      if (existingProduct) {
        await updateExistingProduct(existingProduct, product, destinationBranchId);
      } else {
        await createNewProduct(product, destinationBranchId);
      }
    }
    
    console.log("Destination branch stock updated successfully");
  } catch (error) {
    console.error("Error updating destination branch stock:", error);
    toast.error("Failed to update destination branch stock");
    throw error;
  }
}

/**
 * Updates an existing product's stock in the destination branch
 */
async function updateExistingProduct(
  existingProduct: any,
  transferProduct: ProductWithSelection,
  destinationBranchId: number
): Promise<void> {
  const { error: updateError } = await supabase
    .from("produk")
    .update({ 
      stock: existingProduct.stock + transferProduct.quantity 
    })
    .eq("produk_id", existingProduct.produk_id)
    .eq("cabang_id", destinationBranchId);
    
  if (updateError) {
    console.error(`Error updating destination stock:`, updateError);
    throw new Error(`Error updating destination stock: ${updateError.message}`);
  }
}

/**
 * Creates a new product in the destination branch based on the source product
 */
async function createNewProduct(
  transferProduct: ProductWithSelection,
  destinationBranchId: number
): Promise<void> {
  // Get the original product details
  const { data: originalProduct, error: getError } = await supabase
    .from("produk")
    .select("*")
    .eq("produk_id", transferProduct.produk_id || transferProduct.id)
    .single();
    
  if (getError) {
    console.error(`Error getting original product:`, getError);
    throw new Error(`Error getting product details: ${getError.message}`);
  }
  
  // Create new product in destination branch with a new produk_id
  const newProduct = {
    product_name: originalProduct.product_name,
    barcode: originalProduct.barcode,
    kategori_id: originalProduct.kategori_id,
    cost_price: originalProduct.cost_price,
    retail_price: originalProduct.retail_price,
    member_price_1: originalProduct.member_price_1,
    member_price_2: originalProduct.member_price_2,
    stock: transferProduct.quantity,
    cabang_id: destinationBranchId,
    pelaku_usaha_id: originalProduct.pelaku_usaha_id,
    unit: originalProduct.unit
  };
  
  const { error: insertError } = await supabase
    .from("produk")
    .insert(newProduct);
    
  if (insertError) {
    console.error(`Error creating product in destination branch:`, insertError);
    throw new Error(`Error creating product: ${insertError.message}`);
  }
}
