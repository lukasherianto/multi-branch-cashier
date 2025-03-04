
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";
import { useAuth } from "@/hooks/auth";

export const useProductData = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { pelakuUsaha } = useAuth();

  const fetchProducts = async (branchId?: number | null) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Mengambil data produk untuk cabang ID: ${branchId || 'semua'}`);
      console.log(`Data pelakuUsaha saat ini:`, pelakuUsaha);
      
      if (!pelakuUsaha || !pelakuUsaha.pelaku_usaha_id) {
        console.error('Data pelaku usaha tidak tersedia');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Data profil usaha tidak tersedia. Silakan lengkapi profil usaha Anda terlebih dahulu.",
        });
        return [];
      }

      // Mulai membangun query
      let query = supabase
        .from('produk')
        .select(`
          produk_id,
          product_name,
          retail_price,
          member_price_1,
          member_price_2,
          stock,
          barcode,
          unit,
          cost_price,
          cabang_id,
          kategori_produk (
            kategori_name
          )
        `)
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

      // Jika ID cabang ditentukan, filter produk berdasarkan cabang tersebut
      if (branchId) {
        console.log(`Memfilter berdasarkan cabang ID: ${branchId}`);
        query = query.eq('cabang_id', branchId);
      }

      console.log(`Menjalankan query Supabase...`);
      const { data: productsData, error } = await query;

      if (error) {
        console.error('Error saat mengambil data produk:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Gagal mengambil data produk: ${error.message}`,
        });
        throw error;
      }

      console.log(`Berhasil mengambil ${productsData?.length || 0} produk:`, productsData);

      if (productsData) {
        const mappedProducts = productsData.map(product => ({
          id: product.produk_id,
          name: product.product_name,
          price: product.retail_price,
          member_price_1: product.member_price_1,
          member_price_2: product.member_price_2,
          quantity: 1,
          category: product.kategori_produk?.kategori_name,
          stock: product.stock,
          barcode: product.barcode,
          unit: product.unit,
          cost_price: product.cost_price,
          cabang_id: product.cabang_id
        }));
        
        console.log(`Berhasil memetakan ${mappedProducts.length} produk`);
        return mappedProducts;
      }
      
      return [];
    } catch (error) {
      console.error('Error saat mengambil data produk:', error);
      setError(error instanceof Error ? error : new Error('Error tidak diketahui saat mengambil data produk'));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengambil data produk. Silakan coba lagi.",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { 
    products, 
    setProducts,
    loading,
    error,
    fetchProducts
  };
};
