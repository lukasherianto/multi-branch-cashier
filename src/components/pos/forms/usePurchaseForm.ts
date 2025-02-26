
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseFormData } from "./types";

export const usePurchaseForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .single();

      if (!pelakuUsahaData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Data pelaku usaha tidak ditemukan",
        });
        return;
      }

      // Cek apakah barcode sudah ada jika barcode diisi
      if (data.barcode) {
        const { data: existingProduct } = await supabase
          .from('produk')
          .select('product_name')
          .eq('barcode', data.barcode)
          .single();

        if (existingProduct) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Barcode sudah digunakan untuk produk: ${existingProduct.product_name}`,
          });
          return;
        }
      }

      const { data: newProduct, error: productError } = await supabase
        .from('produk')
        .insert({
          pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
          kategori_id: parseInt(data.kategori_id),
          product_name: data.product_name,
          barcode: data.barcode || null,
          cost_price: data.unit_price,
          retail_price: data.unit_price * 1.2,
          stock: data.quantity
        })
        .select()
        .single();

      if (productError) {
        console.error('Error creating product:', productError);
        throw productError;
      }

      const purchaseData = {
        cabang_id: parseInt(data.cabang_id),
        produk_id: newProduct.produk_id,
        quantity: data.quantity,
        unit_price: data.unit_price,
        total_price: data.quantity * data.unit_price,
        payment_status: data.payment_status === "1" ? 1 : 0,
      };

      const { error: purchaseError } = await supabase
        .from('pembelian')
        .insert(purchaseData);

      if (purchaseError) {
        console.error('Error creating purchase:', purchaseError);
        throw purchaseError;
      }

      const { error: historyError } = await supabase
        .from('produk_history')
        .insert({
          produk_id: newProduct.produk_id,
          cost_price: data.unit_price,
          stock: data.quantity,
          notes: data.price_notes || 'Pembelian baru',
          adjustment_type: data.is_price_change ? 'price_change' : 'initial'
        });

      if (historyError) {
        console.error('Error creating history:', historyError);
        throw historyError;
      }

      toast({
        title: "Sukses",
        description: "Pembelian berhasil ditambahkan",
      });

      navigate("/purchase");
    } catch (error: any) {
      console.error('Error submitting purchase:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menambahkan pembelian",
      });
    }
  };

  return { onSubmit };
};
