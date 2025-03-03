
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";

export async function executeStockTransfer(
  formData: TransferStockFormValues,
  selectedProducts: ProductWithSelection[]
): Promise<number | null> {
  try {
    console.log("Executing stock transfer with data:", formData);
    console.log("Selected products:", selectedProducts);
    
    // Validate the form data
    if (!formData.cabang_id_from || !formData.cabang_id_to) {
      toast("Pilih cabang asal dan tujuan");
      return null;
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
    console.log("Products to transfer:", transferProducts);
    
    if (transferProducts.length === 0) {
      toast("Pilih minimal satu produk untuk ditransfer");
      return null;
    }
    
    let transferId: number | null = null;
    
    // First try to create a transfer record with the first product's details
    // to satisfy the schema requirements
    const firstProduct = transferProducts[0];
    
    const { data: headerResult, error: headerError } = await supabase
      .from("transfer_stok")
      .insert({
        cabang_id_from: parseInt(formData.cabang_id_from),
        cabang_id_to: parseInt(formData.cabang_id_to),
        pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
        status: "pending",
        total_items: transferProducts.length,
        total_quantity: transferProducts.reduce((total, p) => total + p.quantity, 0),
        notes: formData.notes || "",
        // These are required by the schema
        produk_id: firstProduct.produk_id || firstProduct.id,
        quantity: 1 // We'll update this in the details
      })
      .select("transfer_id")
      .single();
      
    if (headerError) {
      console.error("Error creating transfer header:", headerError);
      throw new Error("Error creating transfer: " + headerError.message);
    }
    
    transferId = headerResult.transfer_id;
    console.log("Transfer header created with ID:", transferId);
    
    // Insert transfer details
    for (const product of transferProducts) {
      const { error: detailsError } = await supabase
        .from("transfer_stok_detail")
        .insert({
          transfer_id: transferId,
          produk_id: product.produk_id || product.id,
          quantity: product.quantity,
          retail_price: product.price || 0,
          cost_price: product.cost_price || 0
        });
          
      if (detailsError) {
        console.error("Error creating transfer details:", detailsError);
        throw new Error("Error creating transfer details: " + detailsError.message);
      }
    }
    
    console.log("Transfer details created successfully");
    
    // Update stock in source branch (decrease)
    const sourceStockUpdates = transferProducts.map(async (product) => {
      const { error: updateError } = await supabase
        .from("produk")
        .update({ 
          stock: product.stock - product.quantity 
        })
        .eq("produk_id", product.produk_id || product.id)
        .eq("cabang_id", parseInt(formData.cabang_id_from));
        
      if (updateError) {
        console.error(`Error updating source stock for product ${product.produk_id || product.id}:`, updateError);
        throw new Error(`Error updating stock: ${updateError.message}`);
      }
    });
    
    await Promise.all(sourceStockUpdates);
    
    // Create or update stock in destination branch (increase)
    for (const product of transferProducts) {
      // Check if product exists in destination branch
      const { data: existingProduct, error: checkError } = await supabase
        .from("produk")
        .select("produk_id, stock")
        .eq("barcode", product.barcode)
        .eq("cabang_id", parseInt(formData.cabang_id_to))
        .maybeSingle();
        
      if (checkError) {
        console.error(`Error checking product in destination branch:`, checkError);
        throw new Error(`Error checking product: ${checkError.message}`);
      }
      
      if (existingProduct) {
        // Update existing product stock
        const { error: updateError } = await supabase
          .from("produk")
          .update({ 
            stock: existingProduct.stock + product.quantity 
          })
          .eq("produk_id", existingProduct.produk_id)
          .eq("cabang_id", parseInt(formData.cabang_id_to));
          
        if (updateError) {
          console.error(`Error updating destination stock:`, updateError);
          throw new Error(`Error updating destination stock: ${updateError.message}`);
        }
      } else {
        // Create a copy of the product in the destination branch
        const { data: originalProduct, error: getError } = await supabase
          .from("produk")
          .select("*")
          .eq("produk_id", product.produk_id || product.id)
          .single();
          
        if (getError) {
          console.error(`Error getting original product:`, getError);
          throw new Error(`Error getting product details: ${getError.message}`);
        }
        
        // Create new product in destination branch with a new produk_id
        const newProduct = {
          product_name: originalProduct.product_name,
          barcode: originalProduct.barcode,
          kategori_id: originalProduct.kategori_id,
          cost_price: originalProduct.cost_price,
          retail_price: originalProduct.retail_price,
          member_price_1: originalProduct.member_price_1,
          member_price_2: originalProduct.member_price_2,
          stock: product.quantity,
          cabang_id: parseInt(formData.cabang_id_to),
          pelaku_usaha_id: originalProduct.pelaku_usaha_id,
          unit: originalProduct.unit
        };
        
        const { error: insertError } = await supabase
          .from("produk")
          .insert(newProduct);
          
        if (insertError) {
          console.error(`Error creating product in destination branch:`, insertError);
          throw new Error(`Error creating product: ${insertError.message}`);
        }
      }
    }
    
    return transferId;
  } catch (error) {
    console.error("Error in executeStockTransfer:", error);
    throw error;
  }
}
