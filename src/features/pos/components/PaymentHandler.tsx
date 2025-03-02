
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PaymentHandlerProps } from "../types";

export const usePaymentHandler = ({
  cartItems,
  selectedCabangId,
  cabang,
  memberId,
  customerName,
  whatsappNumber,
  clearCart,
  fetchProducts,
  pelakuUsaha,
}: PaymentHandlerProps) => {
  const navigate = useNavigate();

  const handlePayment = async (pointsToUse: number) => {
    if (!cabang) {
      toast.error("Silakan pilih cabang terlebih dahulu");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Tambahkan produk ke keranjang terlebih dahulu");
      return;
    }

    if (!selectedCabangId) {
      toast.error("ID cabang tidak valid");
      return;
    }

    try {
      console.log("Starting payment process with points:", pointsToUse);
      console.log("Selected branch ID:", selectedCabangId);
      
      // Validate stock for all items
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
          return;
        }
      }

      // Calculate total before points
      const totalBeforePoints = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate total after points
      const finalTotal = totalBeforePoints - (pointsToUse * 1000);
      console.log("Total before points:", totalBeforePoints);
      console.log("Final total after points:", finalTotal);

      // Create transactions for each item
      console.log("Creating transactions for items:", cartItems.length);
      const transactionPromises = cartItems.map(async (item) => {
        const pointsForItem = pointsToUse > 0 
          ? Math.floor((item.price * item.quantity / totalBeforePoints) * pointsToUse) 
          : 0;
          
        console.log(`Creating transaction for item ${item.id}, points allocated: ${pointsForItem}`);
        
        const result = await supabase
          .from('transaksi')
          .insert({
            cabang_id: selectedCabangId,
            produk_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            points_used: pointsForItem,
            pelanggan_id: memberId,
            transaction_date: new Date().toISOString()
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

      // Update product stock
      console.log("Updating product stock for items");
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

      // Create a manual kas entry for the transaction
      // This is a fallback in case the database trigger doesn't work
      console.log("Creating manual kas entry with amount:", finalTotal);
      const { error: kasError } = await supabase
        .from('kas')
        .insert({
          cabang_id: selectedCabangId,
          amount: finalTotal,
          transaction_type: 'masuk',
          description: `Penjualan - ${new Date().toLocaleString()}`,
          transaction_date: new Date().toISOString()
        });
      
      if (kasError) {
        console.error('Error creating kas entry:', kasError);
        // We'll continue even if the kas entry fails, as the transaction is already completed
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
            description: `Penukaran Poin - ${new Date().toLocaleString()}`,
            transaction_date: new Date().toISOString()
          });
          
        if (pointsKasError) {
          console.error('Error creating kas entry for points redemption:', pointsKasError);
        } else {
          console.log("Kas entry for points redemption created successfully");
        }
      }

      // Clear cart and refresh products
      clearCart();
      fetchProducts();
      
      console.log("Payment completed successfully, navigating to print preview");

      // Navigate to print preview
      navigate('/print-preview', {
        state: {
          items: cartItems,
          total: finalTotal,
          pointsUsed: pointsToUse,
          pointsEarned: Math.floor(finalTotal / 1000),
          businessName: pelakuUsaha?.business_name,
          branchName: cabang?.branch_name,
          customerName: customerName,
          whatsappNumber: whatsappNumber
        }
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Gagal memproses pembayaran: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return { handlePayment };
};
