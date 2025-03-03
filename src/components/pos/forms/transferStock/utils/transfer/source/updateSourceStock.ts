
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection } from "@/types/pos";
import { toast } from "sonner";

/**
 * Updates stock in the source branch (decreases stock)
 */
export async function updateSourceBranchStock(
  products: ProductWithSelection[],
  sourceBranchId: number
): Promise<void> {
  try {
    console.log(`Updating source branch (${sourceBranchId}) stock for ${products.length} products`);
    
    const sourceStockUpdates = products.map(async (product) => {
      const { error: updateError } = await supabase
        .from("produk")
        .update({ 
          stock: product.stock - product.quantity 
        })
        .eq("produk_id", product.produk_id || product.id)
        .eq("cabang_id", sourceBranchId);
        
      if (updateError) {
        console.error(`Error updating source stock for product ${product.produk_id || product.id}:`, updateError);
        throw new Error(`Error updating stock: ${updateError.message}`);
      }
    });
    
    await Promise.all(sourceStockUpdates);
    console.log("Source branch stock updated successfully");
  } catch (error) {
    console.error("Error updating source branch stock:", error);
    toast.error("Failed to update source branch stock");
    throw error;
  }
}
