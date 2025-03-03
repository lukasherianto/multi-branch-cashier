
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection } from "@/types/pos";
import { toast } from "sonner";

/**
 * Execute a transfer of stock from central to a branch
 */
export async function transferToBranch(
  centralBranchId: number,
  destinationBranchId: number,
  selectedProducts: ProductWithSelection[],
  notes?: string
): Promise<boolean> {
  try {
    if (!destinationBranchId) {
      toast.error("Pilih cabang tujuan");
      return false;
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
    
    if (transferProducts.length === 0) {
      toast.error("Pilih minimal satu produk untuk ditransfer");
      return false;
    }
    
    // Generate a transfer number (format: TRF-{timestamp})
    const transferNumber = `TRF-${Date.now()}`;
    
    // Process each product for transfer
    for (const product of transferProducts) {
      // Check if product exists in destination branch
      const { data: existingProduct, error: checkError } = await supabase
        .from("produk")
        .select("produk_id, stock")
        .eq("barcode", product.barcode)
        .eq("cabang_id", destinationBranchId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking product:", checkError);
        throw new Error("Error checking product");
      }
      
      if (existingProduct) {
        // If product exists, update stock
        const { error: updateError } = await supabase
          .from("produk")
          .update({ 
            stock: existingProduct.stock + product.quantity 
          })
          .eq("produk_id", existingProduct.produk_id)
          .eq("cabang_id", destinationBranchId);
          
        if (updateError) {
          console.error("Error updating stock:", updateError);
          throw new Error("Error updating stock");
        }
      } else {
        // If product doesn't exist, create it
        // Get the original product details first
        const { data: originalProduct, error: getError } = await supabase
          .from("produk")
          .select("*")
          .eq("produk_id", product.produk_id || product.id)
          .single();
          
        if (getError) {
          console.error("Error getting product details:", getError);
          throw new Error("Error getting product details");
        }
        
        const newProduct = {
          product_name: originalProduct.product_name,
          barcode: originalProduct.barcode,
          kategori_id: originalProduct.kategori_id,
          cost_price: originalProduct.cost_price,
          retail_price: originalProduct.retail_price,
          member_price_1: originalProduct.member_price_1,
          member_price_2: originalProduct.member_price_2,
          stock: product.quantity,
          cabang_id: destinationBranchId,
          pelaku_usaha_id: originalProduct.pelaku_usaha_id,
          unit: originalProduct.unit
        };
        
        const { error: insertError } = await supabase
          .from("produk")
          .insert(newProduct);
          
        if (insertError) {
          console.error("Error creating product:", insertError);
          throw new Error("Error creating product");
        }
      }
      
      // Record in transfer history
      const historyEntry = {
        nomor_transfer: transferNumber,
        produk_id: product.produk_id || product.id,
        nama_produk: product.name,
        jumlah_produk: product.quantity,
        harga_satuan: product.price || 0,
        satuan: product.unit || 'Pcs',
        total_harga: (product.price || 0) * product.quantity,
        cabang_id_from: centralBranchId,
        cabang_id_to: destinationBranchId,
        tanggal_transfer: new Date().toISOString()
      };
      
      const { error: historyError } = await supabase
        .from('riwayat_transfer_stok')
        .insert(historyEntry);
        
      if (historyError) {
        console.error("Error saving transfer history:", historyError);
        throw new Error("Error saving transfer history");
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in transferToBranch:", error);
    throw error;
  }
}
