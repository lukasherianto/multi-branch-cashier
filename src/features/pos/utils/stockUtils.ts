
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";
import { toast } from "sonner";

/**
 * Validates that there is sufficient stock for all items in the cart
 * @returns true if validation passes, false otherwise
 */
export const validateStock = async (cartItems: CartItem[]): Promise<boolean> => {
  for (const item of cartItems) {
    const { data: productData, error: productError } = await supabase
      .from('produk')
      .select('stock')
      .eq('produk_id', item.id)
      .single();

    if (productError) {
      console.error("Error fetching product stock:", productError);
      throw new Error(`Error validating stock for ${item.name}: ${productError.message}`);
    }

    if (!productData || productData.stock < item.quantity) {
      toast.error(`Stok tidak cukup untuk produk: ${item.name}`);
      return false;
    }
  }
  
  return true;
};

/**
 * Updates product stock after a successful transaction
 */
export const updateProductStock = async (cartItems: CartItem[]): Promise<void> => {
  const stockUpdatePromises = cartItems.map(async item => {
    try {
      const { data: currentProduct, error: fetchError } = await supabase
        .from('produk')
        .select('stock')
        .eq('produk_id', item.id)
        .single();
      
      if (fetchError) {
        console.error(`Error fetching current stock for product ${item.id}:`, fetchError);
        throw fetchError;
      }
      
      if (currentProduct) {
        const newStock = currentProduct.stock - item.quantity;
        console.log(`Updating stock for product ${item.id}: ${currentProduct.stock} -> ${newStock}`);
        
        const { error: updateError } = await supabase
          .from('produk')
          .update({ 
            stock: newStock 
          })
          .eq('produk_id', item.id);
          
        if (updateError) {
          console.error(`Error updating stock for product ${item.id}:`, updateError);
          throw updateError;
        }
      }
    } catch (err) {
      console.error(`Error in stock update for product ${item.id}:`, err);
      throw err;
    }
  });

  await Promise.all(stockUpdatePromises);
};
