
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TransferToBranchFormValues } from "./schema";
import { CartItem } from "@/types/pos";

export const useTransferToBranchSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTransfer = async (
    values: TransferToBranchFormValues,
    selectedProducts: CartItem[],
    sourceBranchId: string | null,
    onSuccess?: () => void
  ) => {
    if (!sourceBranchId) {
      toast("Cabang pusat tidak terdeteksi");
      return;
    }

    const productsToTransfer = selectedProducts.filter(p => p.selected);
    
    if (productsToTransfer.length === 0) {
      toast("Tidak ada produk yang dipilih untuk transfer");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate stock availability
      const stockValid = await validateStockForTransfer(
        productsToTransfer, 
        parseInt(sourceBranchId)
      );
      
      if (!stockValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Execute the transfer
      const transferId = await executeTransfer(
        values, 
        productsToTransfer, 
        parseInt(sourceBranchId)
      );
      
      if (transferId) {
        toast.success(`Transfer stok berhasil dengan nomor: ${transferId}`);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error(`Gagal melakukan transfer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitTransfer };
};

// Validate stock availability for transfer
const validateStockForTransfer = async (
  products: CartItem[],
  sourceBranchId: number
): Promise<boolean> => {
  try {
    for (const product of products) {
      // Check stock availability
      const { data, error } = await supabase
        .from('produk')
        .select('stock')
        .eq('produk_id', product.id)
        .eq('cabang_id', sourceBranchId)
        .single();
      
      if (error) {
        console.error("Error checking stock:", error);
        throw new Error(`Error checking stock for ${product.name}: ${error.message}`);
      }
      
      if (!data || data.stock < product.quantity) {
        toast.error(`Stok tidak cukup untuk produk: ${product.name}`);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Stock validation error:", error);
    throw error;
  }
};

// Execute the transfer operation
const executeTransfer = async (
  values: TransferToBranchFormValues,
  products: CartItem[],
  sourceBranchId: number
): Promise<number | null> => {
  const destinationBranchId = parseInt(values.cabang_id_to);
  
  try {
    // Start a transaction
    console.log("Starting transfer from central to branch");
    
    // Array to store all transfer operations
    const transferOperations = [];
    let lastTransferId = null;
    
    for (const product of products) {
      console.log(`Processing product ${product.id}: ${product.name}, quantity: ${product.quantity}`);
      
      // 1. Decrease stock in source branch (central)
      const { error: decreaseError } = await supabase
        .from('produk')
        .update({ 
          stock: supabase.rpc('decrement', { x: product.quantity }) 
        })
        .eq('produk_id', product.id)
        .eq('cabang_id', sourceBranchId);
        
      if (decreaseError) throw decreaseError;
      
      // 2. Check if product exists in destination branch
      const { data: existingProduct, error: checkError } = await supabase
        .from('produk')
        .select('produk_id, stock')
        .eq('produk_id', product.id)
        .eq('cabang_id', destinationBranchId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // 3. Update or create product in destination branch
      if (existingProduct) {
        // Product exists, update stock
        const { error: updateError } = await supabase
          .from('produk')
          .update({ 
            stock: existingProduct.stock + product.quantity 
          })
          .eq('produk_id', product.id)
          .eq('cabang_id', destinationBranchId);
          
        if (updateError) throw updateError;
      } else {
        // Product doesn't exist, create it
        const { data: sourceProduct, error: sourceError } = await supabase
          .from('produk')
          .select('*')
          .eq('produk_id', product.id)
          .eq('cabang_id', sourceBranchId)
          .single();
          
        if (sourceError) throw sourceError;
        
        const { error: insertError } = await supabase
          .from('produk')
          .insert({
            produk_id: sourceProduct.produk_id,
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
          
        if (insertError) throw insertError;
      }
      
      // 4. Create transfer record
      const { data: transferRecord, error: transferError } = await supabase
        .from('transfer_stok')
        .insert({
          cabang_id_from: sourceBranchId,
          cabang_id_to: destinationBranchId,
          produk_id: product.id,
          quantity: product.quantity
        })
        .select('transfer_id')
        .single();
        
      if (transferError) throw transferError;
      
      lastTransferId = transferRecord.transfer_id;
    }
    
    console.log("Transfer completed successfully with ID:", lastTransferId);
    return lastTransferId;
    
  } catch (error) {
    console.error("Transfer error:", error);
    throw error;
  }
};
