
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";

/**
 * Creates history entries for a stock transfer
 */
export async function createTransferHistory(
  transferNumber: string,
  formData: TransferStockFormValues,
  transferProducts: ProductWithSelection[]
): Promise<boolean> {
  try {
    // Create history entries
    const historyEntries = transferProducts.map(product => ({
      nomor_transfer: transferNumber,
      produk_id: product.produk_id || product.id,
      nama_produk: product.name,
      jumlah_produk: product.quantity,
      harga_satuan: product.price || 0,
      satuan: product.unit || 'Pcs',
      total_harga: (product.price || 0) * product.quantity,
      cabang_id_from: parseInt(formData.cabang_id_from),
      cabang_id_to: parseInt(formData.cabang_id_to),
      tanggal_transfer: new Date().toISOString()
    }));
    
    // Save history to database
    const { error: historyError } = await supabase
      .from('riwayat_transfer_stok')
      .insert(historyEntries);
      
    if (historyError) {
      console.error("Error saving transfer history:", historyError);
      throw new Error("Error saving transfer history");
    }
    
    return true;
  } catch (error) {
    console.error("Error creating transfer history:", error);
    throw error;
  }
}
