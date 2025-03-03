
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TransferStockFormValues } from "../schema";
import { CartItem } from "@/types/pos";

// Validate that products have sufficient stock for transfer
export const validateStockForTransfer = async (
  products: CartItem[],
  sourceBranchId: string
): Promise<boolean> => {
  try {
    for (const product of products) {
      if (!product.selected) continue;
      
      // Check stock availability
      const { data, error } = await supabase
        .from('produk')
        .select('stock')
        .eq('produk_id', product.id)
        .eq('cabang_id', parseInt(sourceBranchId))
        .single();
      
      if (error) {
        console.error("Error checking stock:", error);
        throw new Error(`Error checking stock for ${product.name}: ${error.message}`);
      }
      
      if (!data || data.stock < product.quantity) {
        toast(`Stok tidak cukup untuk produk: ${product.name}`);
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

// Execute stock transfer between branches
export const executeStockTransfer = async (
  values: TransferStockFormValues,
  products: CartItem[]
): Promise<number | null> => {
  const selectedProducts = products.filter(p => p.selected);
  const sourceBranchId = parseInt(values.cabang_id_from);
  const destinationBranchId = parseInt(values.cabang_id_to);
  
  if (selectedProducts.length === 0) {
    toast("Tidak ada produk yang dipilih untuk transfer");
    return null;
  }
  
  try {
    // Start a transaction
    console.log("Starting transaction for stock transfer");
    
    // Array to store all transfer operations
    const transferOperations = [];
    
    for (const product of selectedProducts) {
      console.log(`Processing product ${product.id}: ${product.name}`);
      
      // 1. Decrease stock in source branch
      const decreaseSource = supabase
        .from('produk')
        .update({ 
          stock: supabase.rpc('decrement', { x: product.quantity }) 
        })
        .eq('produk_id', product.id)
        .eq('cabang_id', sourceBranchId);
      
      // 2. Increase stock in destination branch
      const { data: existingProduct } = await supabase
        .from('produk')
        .select('produk_id')
        .eq('produk_id', product.id)
        .eq('cabang_id', destinationBranchId)
        .single();
      
      let destinationOperation;
      
      if (existingProduct) {
        // Product exists in destination branch, update stock
        destinationOperation = supabase
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
        
        destinationOperation = supabase
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
      const createTransferRecord = supabase
        .from('transfer_stok')
        .insert({
          cabang_id_from: sourceBranchId,
          cabang_id_to: destinationBranchId,
          produk_id: product.id,
          quantity: product.quantity
        });
      
      transferOperations.push(decreaseSource);
      transferOperations.push(destinationOperation);
      transferOperations.push(createTransferRecord);
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
    
    console.log("Stock transfer completed successfully");
    return transferId;
    
  } catch (error) {
    console.error("Stock transfer error:", error);
    throw error;
  }
};
