
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";
import { toast } from "sonner";

/**
 * Checks if a product has already been created in the destination branch
 */
export const checkProductExists = async (
  productId: number,
  destinationBranchId: number
): Promise<boolean> => {
  const { data } = await supabase
    .from('produk')
    .select('produk_id')
    .eq('produk_id', productId)
    .eq('cabang_id', destinationBranchId)
    .single();
    
  return !!data;
};

/**
 * Validates that central branch has sufficient stock for transfer
 */
export const validateStockForTransfer = async (
  products: CartItem[],
  sourceBranchId: number
): Promise<boolean> => {
  try {
    for (const product of products) {
      if (!product.selected) continue;
      
      // Check stock availability
      const { data, error } = await supabase
        .from('produk')
        .select('stock')
        .eq('produk_id', product.id)
        .eq('cabang_id', sourceBranchId)
        .single();
      
      if (error) {
        console.error("Error checking stock:", error);
        throw new Error(`Error checking stock for ${product.name}`);
      }
      
      if (!data || data.stock < product.quantity) {
        toast(`Stok pusat tidak cukup untuk produk: ${product.name}`);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Stock validation error:", error);
    toast(`Error validating stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};

/**
 * Execute stock transfer from central branch to destination branch
 */
export const executeTransferToBranch = async (
  selectedProducts: CartItem[],
  sourceBranchId: number,
  destinationBranchId: number
): Promise<number | null> => {
  if (selectedProducts.length === 0) {
    toast("Tidak ada produk yang dipilih untuk transfer");
    return null;
  }
  
  try {
    // Start a transaction
    console.log("Starting transaction for stock transfer to branch");
    
    // Array to store all transfer operations
    const transferOperations = [];
    
    for (const product of selectedProducts) {
      console.log(`Processing product ${product.id}: ${product.name}`);
      
      // 1. Decrease stock in source branch (central)
      const decreaseSourcePromise = supabase
        .from('produk')
        .update({ 
          stock: supabase.rpc('decrement', { x: product.quantity }) 
        })
        .eq('produk_id', product.id)
        .eq('cabang_id', sourceBranchId);
      
      // 2. Check if product exists in destination branch
      const productExists = await checkProductExists(product.id, destinationBranchId);
      
      let destinationOperationPromise;
      
      if (productExists) {
        // Product exists in destination branch, update stock
        destinationOperationPromise = supabase
          .from('produk')
          .update({ 
            stock: supabase.rpc('increment', { x: product.quantity }) 
          })
          .eq('produk_id', product.id)
          .eq('cabang_id', destinationBranchId);
      } else {
        // Product doesn't exist in destination branch, create it
        const { data: sourceProduct } = await supabase
          .from('produk')
          .select('*')
          .eq('produk_id', product.id)
          .eq('cabang_id', sourceBranchId)
          .single();
          
        if (!sourceProduct) {
          throw new Error(`Source product ${product.id} not found`);
        }
        
        // Create new product in destination branch
        destinationOperationPromise = supabase
          .from('produk')
          .insert({
            pelaku_usaha_id: sourceProduct.pelaku_usaha_id,
            kategori_id: sourceProduct.kategori_id,
            product_name: sourceProduct.product_name,
            cost_price: sourceProduct.cost_price,
            retail_price: sourceProduct.retail_price,
            member_price_1: sourceProduct.member_price_1,
            member_price_2: sourceProduct.member_price_2,
            barcode: sourceProduct.barcode,
            unit: sourceProduct.unit,
            stock: product.quantity,
            cabang_id: destinationBranchId
          });
      }
      
      // 3. Create transfer record
      const createTransferRecordPromise = supabase
        .from('transfer_stok')
        .insert({
          cabang_id_from: sourceBranchId,
          cabang_id_to: destinationBranchId,
          produk_id: product.id,
          quantity: product.quantity
        });
      
      transferOperations.push(decreaseSourcePromise);
      transferOperations.push(destinationOperationPromise);
      transferOperations.push(createTransferRecordPromise);
    }
    
    // Execute all operations
    const results = await Promise.all(transferOperations);
    
    // Check for errors
    for (const result of results) {
      if (result.error) {
        throw new Error(`Transfer operation failed: ${result.error.message}`);
      }
    }
    
    // Get the transfer ID from the last operation (should be a transfer_stok insert)
    const lastOperation = results[results.length - 1];
    const transferId = lastOperation.data?.[0]?.transfer_id || null;
    
    console.log("Stock transfer to branch completed successfully");
    return transferId;
    
  } catch (error) {
    console.error("Stock transfer error:", error);
    throw error;
  }
};
