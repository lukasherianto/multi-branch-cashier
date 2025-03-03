
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection, TransferToBranchValues } from "@/types/pos";
import { toast } from "sonner";

/**
 * Validates if the selected products have enough stock for transfer
 */
export const validateStockForTransfer = async (
  selectedProducts: ProductWithSelection[],
  centralBranchId: number
): Promise<boolean> => {
  try {
    // Check each product for sufficient stock
    for (const product of selectedProducts) {
      if (product.quantity > product.stock) {
        toast(`Stok ${product.name} tidak cukup (${product.stock} tersedia)`);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error validating stock:", error);
    toast(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
};

/**
 * Executes the stock transfer from central to branch operation
 */
export const executeTransferToBranch = async (
  data: TransferToBranchValues,
  selectedProducts: ProductWithSelection[],
  centralBranchId: number
): Promise<number | null> => {
  try {
    // Get user's pelaku_usaha_id
    const { data: userData } = await supabase.auth.getUser();
    const { data: pelakuUsahaData } = await supabase
      .from('pelaku_usaha')
      .select('pelaku_usaha_id')
      .eq('user_id', userData.user?.id)
      .single();
      
    if (!pelakuUsahaData) {
      throw new Error("Pelaku usaha data not found");
    }
    
    // 1. Create transfer record
    const { data: transferData, error: transferError } = await supabase
      .from('transfer_stok')
      .insert({
        cabang_id_from: centralBranchId,
        cabang_id_to: parseInt(data.cabang_id_to),
        pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
        status: 'completed',
        total_items: selectedProducts.length,
        total_quantity: selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
        notes: data.notes || 'Transfer Stok dari Pusat ke Cabang'
      })
      .select('transfer_id')
      .single();
      
    if (transferError) throw transferError;
    if (!transferData) throw new Error("Failed to create transfer record");
    
    const transferId = transferData.transfer_id;
    
    // 2. Create transfer details
    // Prepare detail records array for batch insert
    const detailRecords = selectedProducts.map(product => ({
      transfer_id: transferId,
      produk_id: product.id,
      quantity: product.quantity,
      retail_price: product.price,
      cost_price: product.cost_price
    }));
    
    // Insert transfer details
    const { error: detailsError } = await supabase
      .from('transfer_stok_detail')
      .insert(detailRecords);
      
    if (detailsError) throw detailsError;
    
    // 3. Update source and destination branch stocks
    for (const product of selectedProducts) {
      // Update stock in central branch (decrease)
      const { error: sourceStockError } = await supabase
        .from('produk')
        .update({ 
          stock: product.stock - product.quantity 
        })
        .eq('produk_id', product.id)
        .eq('cabang_id', centralBranchId);
        
      if (sourceStockError) throw sourceStockError;
      
      // Check if product exists in destination branch
      const { data: existingProduct, error: fetchError } = await supabase
        .from('produk')
        .select('produk_id, stock')
        .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
        .eq('cabang_id', parseInt(data.cabang_id_to))
        .eq('product_name', product.name)
        .maybeSingle();
        
      if (fetchError && fetchError.code !== 'PGRST116') { // Not found is not an error here
        throw fetchError;
      }
      
      if (existingProduct) {
        // Update existing product stock
        const { error: updateError } = await supabase
          .from('produk')
          .update({ 
            stock: existingProduct.stock + product.quantity 
          })
          .eq('produk_id', existingProduct.produk_id);
          
        if (updateError) throw updateError;
      } else {
        // Create new product in destination branch
        const { data: categoryData } = await supabase
          .from('kategori_produk')
          .select('kategori_id')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
          .eq('kategori_name', product.category || 'Umum')
          .maybeSingle();
          
        const kategoriId = categoryData?.kategori_id || 1; // Default to 1 if not found
        
        const { error: insertError } = await supabase
          .from('produk')
          .insert({
            pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
            cabang_id: parseInt(data.cabang_id_to),
            product_name: product.name,
            retail_price: product.price,
            member_price_1: product.member_price_1,
            member_price_2: product.member_price_2,
            stock: product.quantity,
            barcode: product.barcode,
            unit: product.unit,
            cost_price: product.cost_price,
            kategori_id: kategoriId
          });
          
        if (insertError) throw insertError;
      }
    }
    
    return transferId;
  } catch (error) {
    console.error("Error executing transfer:", error);
    toast(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
};

// Export the submit function
export const useTransferToBranchSubmit = (centralBranchId: number) => {
  return async (data: TransferToBranchValues, selectedProducts: ProductWithSelection[]) => {
    // Validate and execute the transfer
    const isValid = await validateStockForTransfer(selectedProducts, centralBranchId);
    if (!isValid) return null;
    
    const transferId = await executeTransferToBranch(data, selectedProducts, centralBranchId);
    return transferId;
  };
};
