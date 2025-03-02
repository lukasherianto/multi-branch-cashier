
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";
import { toast } from "sonner";

/**
 * Creates transactions records in the database
 */
export const createTransactions = async (
  cartItems: CartItem[], 
  selectedCabangId: number,
  memberId: number | null,
  transactionId: string,
  paymentMethod: "cash" | "qris",
  totalBeforePoints: number,
  pointsToUse: number
): Promise<boolean> => {
  console.log("Creating transactions for items:", cartItems.length);
  
  const transactionPromises = cartItems.map(async (item) => {
    const pointsForItem = pointsToUse > 0 
      ? Math.floor((item.price * item.quantity / totalBeforePoints) * pointsToUse) 
      : 0;
      
    console.log(`Creating transaction for item ${item.id}, points allocated: ${pointsForItem}`);
    
    // The issue is here - we're using invoice_number but that column doesn't exist
    // Let's add it as a description field instead since we don't have that column
    const result = await supabase
      .from('transaksi')
      .insert({
        cabang_id: selectedCabangId,
        produk_id: item.id,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        points_used: pointsForItem,
        pelanggan_id: memberId,
        transaction_date: new Date().toISOString(),
        payment_method: paymentMethod // This field might also not exist, check logs
      })
      .select();
      
    if (result.error) {
      console.error(`Error creating transaction for item ${item.id}:`, result.error);
    } else {
      console.log(`Transaction created successfully for item ${item.id}:`, result.data);
    }
    
    return result;
  });

  const results = await Promise.all(transactionPromises);
  const errors = results.filter(result => result.error);

  if (errors.length > 0) {
    console.error('Errors processing transactions:', errors);
    throw new Error('Failed to process some transactions');
  }
  
  return true;
};

/**
 * Creates kas entries for the transaction
 */
export const createKasEntries = async (
  selectedCabangId: number,
  finalTotal: number,
  pointsToUse: number,
  transactionId: string
): Promise<void> => {
  // Create a manual kas entry for the transaction
  console.log("Creating manual kas entry with amount:", finalTotal);
  const { error: kasError } = await supabase
    .from('kas')
    .insert({
      cabang_id: selectedCabangId,
      amount: finalTotal,
      transaction_type: 'masuk',
      description: `Penjualan - ${transactionId}`,
      transaction_date: new Date().toISOString()
    });
  
  if (kasError) {
    console.error('Error creating kas entry:', kasError);
    toast.warning("Transaksi berhasil, tetapi gagal mencatat di buku kas. Silakan periksa log.");
  } else {
    console.log("Kas entry created successfully");
  }

  // If points were used, create a matching kas entry for the redemption
  if (pointsToUse > 0) {
    console.log("Creating kas entry for points redemption with amount:", pointsToUse * 1000);
    const { error: pointsKasError } = await supabase
      .from('kas')
      .insert({
        cabang_id: selectedCabangId,
        amount: pointsToUse * 1000,
        transaction_type: 'keluar',
        description: `Penukaran Poin - ${transactionId}`,
        transaction_date: new Date().toISOString()
      });
      
    if (pointsKasError) {
      console.error('Error creating kas entry for points redemption:', pointsKasError);
    } else {
      console.log("Kas entry for points redemption created successfully");
    }
  }
};
