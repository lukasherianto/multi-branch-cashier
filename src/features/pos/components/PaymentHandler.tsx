
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

    try {
      // Validate stock for all items
      for (const item of cartItems) {
        const { data: productData } = await supabase
          .from('produk')
          .select('stock')
          .eq('produk_id', item.id)
          .single();

        if (!productData || productData.stock < item.quantity) {
          toast.error(`Stok tidak cukup untuk produk: ${item.name}`);
          return;
        }
      }

      // Calculate total before points
      const totalBeforePoints = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate total after points
      const finalTotal = totalBeforePoints - (pointsToUse * 1000);

      // Create transactions for each item
      const transactionPromises = cartItems.map(item => 
        supabase
          .from('transaksi')
          .insert({
            cabang_id: selectedCabangId,
            produk_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            points_used: pointsToUse > 0 ? Math.floor((item.price * item.quantity / totalBeforePoints) * pointsToUse) : 0,
            pelanggan_id: memberId,
            transaction_date: new Date().toISOString()
          })
          .select()
      );

      const results = await Promise.all(transactionPromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        console.error('Errors processing transactions:', errors);
        throw new Error('Failed to process some transactions');
      }

      // Update product stock
      const stockUpdatePromises = cartItems.map(async item => {
        const { data: currentProduct } = await supabase
          .from('produk')
          .select('stock')
          .eq('produk_id', item.id)
          .single();
        
        if (currentProduct) {
          return supabase
            .from('produk')
            .update({ 
              stock: currentProduct.stock - item.quantity 
            })
            .eq('produk_id', item.id);
        }
      });

      await Promise.all(stockUpdatePromises);

      // Create a manual kas entry for the entire transaction if needed
      // This is a fallback in case the database trigger doesn't work
      if (pointsToUse === 0) {
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
          // Transaction already completed, so just log this error
        }
      }

      // Clear cart and refresh products
      clearCart();
      fetchProducts();

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
      toast.error("Gagal memproses pembayaran");
    }
  };

  return { handlePayment };
};
