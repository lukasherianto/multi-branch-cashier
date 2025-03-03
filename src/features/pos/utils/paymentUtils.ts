
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
  
  // Jika memberId bukan null tapi juga bukan ID yang valid, kita set menjadi null
  // untuk menghindari foreign key constraint error
  let validMemberId = memberId;
  
  if (memberId !== null) {
    try {
      // Periksa apakah pelanggan dengan ID ini benar-benar ada di database
      const { data: pelangganData, error: pelangganError } = await supabase
        .from('pelanggan')
        .select('pelanggan_id')
        .eq('pelanggan_id', memberId)
        .maybeSingle();
        
      if (pelangganError || !pelangganData) {
        console.log(`Pelanggan dengan ID ${memberId} tidak ditemukan, mengatur pelanggan_id ke null`);
        validMemberId = null;
      } else {
        console.log(`Pelanggan dengan ID ${memberId} ditemukan, melanjutkan transaksi`);
      }
    } catch (error) {
      console.error("Error validating pelanggan:", error);
      validMemberId = null;
    }
  }
  
  try {
    const transactionPromises = cartItems.map(async (item) => {
      const pointsForItem = pointsToUse > 0 
        ? Math.floor((item.price * item.quantity / totalBeforePoints) * pointsToUse) 
        : 0;
        
      console.log(`Creating transaction for item ${item.id}, points allocated: ${pointsForItem}`);
      console.log(`Using pelanggan_id: ${validMemberId}`);
      
      // Store the transaction ID in the description field since we don't have a dedicated column
      const result = await supabase
        .from('transaksi')
        .insert({
          cabang_id: selectedCabangId,
          produk_id: item.id,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          points_used: pointsForItem,
          pelanggan_id: validMemberId, // Menggunakan memberId yang sudah divalidasi
          transaction_date: new Date().toISOString(),
          payment_method: paymentMethod
        })
        .select();
        
      if (result.error) {
        console.error(`Error creating transaction for item ${item.id}:`, result.error);
        throw result.error;
      } else {
        console.log(`Transaction created successfully for item ${item.id}:`, result.data);
      }
      
      return result;
    });

    await Promise.all(transactionPromises);
    return true;
  } catch (error) {
    console.error('Errors processing transactions:', error);
    throw new Error(`Failed to process transactions: ${error.message || "Unknown error"}`);
  }
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
