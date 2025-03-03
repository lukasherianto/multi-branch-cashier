
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TransferStockFormValues } from "../useTransferStock";
import { ProductWithSelection } from "@/types/pos";

/**
 * Validates if there's sufficient stock for the selected products
 */
export const validateStockForTransfer = async (
  products: ProductWithSelection[],
  sourceBranchId: string
): Promise<boolean> => {
  try {
    const selectedProducts = products.filter(p => p.selected);
    
    // Check if any products are selected
    if (selectedProducts.length === 0) {
      toast("Pilih minimal satu produk untuk ditransfer");
      return false;
    }
    
    // Validate current stock for each product
    for (const product of selectedProducts) {
      if (product.quantity <= 0) {
        toast(`Quantity untuk ${product.name} harus lebih dari 0`);
        return false;
      }
      
      if (product.quantity > product.stock) {
        toast(`Stok tidak cukup untuk produk: ${product.name}. Stok tersedia: ${product.stock}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error validating stock:", error);
    toast(`Error validating stock: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
};

/**
 * Executes the stock transfer process
 */
export const executeStockTransfer = async (
  data: TransferStockFormValues,
  products: ProductWithSelection[]
): Promise<number | null> => {
  try {
    const selectedProducts = products.filter(p => p.selected);
    
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
        cabang_id_from: parseInt(data.cabang_id_from),
        cabang_id_to: parseInt(data.cabang_id_to),
        pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
        status: 'completed',
        total_items: selectedProducts.length,
        total_quantity: selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
        notes: data.notes || 'Transfer stok'
      })
      .select('transfer_id')
      .single();
      
    if (transferError) throw transferError;
    if (!transferData) throw new Error("Failed to create transfer record");
    
    const transferId = transferData.transfer_id;
    
    // 2. Create transfer details
    const transferDetails = selectedProducts.map(product => ({
      transfer_id: transferId,
      produk_id: product.id,
      quantity: product.quantity,
      retail_price: product.price,
      cost_price: product.cost_price
    }));
    
    const { error: detailsError } = await supabase
      .from('transfer_stok_detail')
      .insert(transferDetails);
      
    if (detailsError) throw detailsError;
    
    // 3. Update stock in source branch (decrease)
    for (const product of selectedProducts) {
      const { error: sourceStockError } = await supabase
        .from('produk')
        .update({ 
          stock: product.stock - product.quantity 
        })
        .eq('produk_id', product.id)
        .eq('cabang_id', parseInt(data.cabang_id_from));
        
      if (sourceStockError) throw sourceStockError;
    }
    
    // 4. Update or create products in destination branch
    for (const product of selectedProducts) {
      // Check if product exists in destination branch
      const { data: existingProduct, error: fetchError } = await supabase
        .from('produk')
        .select('produk_id, stock')
        .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
        .eq('cabang_id', parseInt(data.cabang_id_to))
        .eq('product_name', product.name)
        .single();
        
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
            kategori_id: await getKategoriId(product.category, pelakuUsahaData.pelaku_usaha_id)
          });
          
        if (insertError) throw insertError;
      }
    }
    
    return transferId;
  } catch (error) {
    console.error("Error executing transfer:", error);
    toast(`Error executing transfer: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
};

/**
 * Helper function to get or create a kategori_id
 */
const getKategoriId = async (
  kategoriName: string | undefined,
  pelakuUsahaId: number
): Promise<number> => {
  if (!kategoriName) {
    // Get the default category id
    const { data: defaultCategory } = await supabase
      .from('kategori_produk')
      .select('kategori_id')
      .eq('pelaku_usaha_id', pelakuUsahaId)
      .eq('kategori_name', 'Umum')
      .single();
      
    if (defaultCategory) {
      return defaultCategory.kategori_id;
    }
    
    // If no default category exists, create one
    const { data: newCategory } = await supabase
      .from('kategori_produk')
      .insert({
        pelaku_usaha_id: pelakuUsahaId,
        kategori_name: 'Umum'
      })
      .select('kategori_id')
      .single();
      
    return newCategory ? newCategory.kategori_id : 1; // Fallback to 1 if all else fails
  }
  
  // Try to find the category
  const { data: category } = await supabase
    .from('kategori_produk')
    .select('kategori_id')
    .eq('pelaku_usaha_id', pelakuUsahaId)
    .eq('kategori_name', kategoriName)
    .single();
    
  if (category) {
    return category.kategori_id;
  }
  
  // Create the category if it doesn't exist
  const { data: newCategory } = await supabase
    .from('kategori_produk')
    .insert({
      pelaku_usaha_id: pelakuUsahaId,
      kategori_name: kategoriName
    })
    .select('kategori_id')
    .single();
    
  return newCategory ? newCategory.kategori_id : 1; // Fallback to 1 if all else fails
};
