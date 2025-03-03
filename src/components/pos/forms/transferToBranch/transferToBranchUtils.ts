
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductWithSelection } from "@/types/pos";

interface TransferData {
  sourceBranchId: string;
  destinationBranchId: string;
  selectedProducts: ProductWithSelection[];
  notes?: string;
}

/**
 * Transfer products from central branch to destination branch
 */
export async function transferToBranch(data: TransferData): Promise<boolean> {
  try {
    const { sourceBranchId, destinationBranchId, selectedProducts, notes } = data;
    
    if (!sourceBranchId || !destinationBranchId) {
      toast("Pilih cabang asal dan tujuan");
      return false;
    }
    
    // Get selected products
    const productsToTransfer = selectedProducts.filter(p => p.selected && p.quantity > 0);
    
    if (productsToTransfer.length === 0) {
      toast("Pilih minimal satu produk untuk ditransfer");
      return false;
    }

    // Since transfer_stok table was removed, we now directly update stock
    // For each product, decrease stock in source and increase in destination
    for (const product of productsToTransfer) {
      // 1. Decrease stock in source branch
      const { error: sourceError } = await supabase
        .from('produk')
        .update({ 
          stock: product.stock - product.quantity 
        })
        .eq('produk_id', product.produk_id || product.id)
        .eq('cabang_id', parseInt(sourceBranchId));
      
      if (sourceError) {
        console.error("Error updating source branch stock:", sourceError);
        throw sourceError;
      }
      
      // 2. Check if product exists in destination branch
      const { data: existingProduct, error: checkError } = await supabase
        .from('produk')
        .select('produk_id, stock')
        .eq('produk_id', product.produk_id || product.id)
        .eq('cabang_id', parseInt(destinationBranchId))
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking destination product:", checkError);
        throw checkError;
      }
      
      if (existingProduct) {
        // 3a. If exists, update stock
        const { error: updateError } = await supabase
          .from('produk')
          .update({ 
            stock: existingProduct.stock + product.quantity 
          })
          .eq('produk_id', product.produk_id || product.id)
          .eq('cabang_id', parseInt(destinationBranchId));
        
        if (updateError) {
          console.error("Error updating destination branch stock:", updateError);
          throw updateError;
        }
      } else {
        // 3b. If doesn't exist, create product in destination branch
        const { error: createError } = await supabase
          .from('produk')
          .insert({
            produk_id: product.produk_id || product.id,
            cabang_id: parseInt(destinationBranchId),
            product_name: product.name,
            kategori_id: product.kategori_id || 1, // Default category if not available
            cost_price: product.cost_price || 0,
            retail_price: product.price || 0,
            stock: product.quantity,
            pelaku_usaha_id: product.pelaku_usaha_id || 1, // This should come from context
            barcode: product.barcode,
            unit: product.unit || 'Pcs',
            member_price_1: product.member_price_1,
            member_price_2: product.member_price_2
          });
        
        if (createError) {
          console.error("Error creating product in destination branch:", createError);
          throw createError;
        }
      }
    }
    
    toast("Transfer berhasil dilakukan");
    return true;
    
  } catch (error) {
    console.error("Error in transfer:", error);
    toast(`Error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}
