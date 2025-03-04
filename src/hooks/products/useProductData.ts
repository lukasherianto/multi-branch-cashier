
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
      console.log(`Fetching products for branch ID: ${branchId || 'all'}`);
      console.log(`Current pelakuUsaha:`, pelakuUsaha);
      
      if (!pelakuUsaha || !pelakuUsaha.pelaku_usaha_id) {
        console.error('No pelaku usaha data available');
        return [];
      }

      // Start building the query
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

      // If a branch ID is specified, filter products by that branch
      if (branchId) {
        query = query.eq('cabang_id', branchId);
      }

      const { data: productsData, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log(`Fetched ${productsData?.length || 0} products:`, productsData);

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
        
        console.log(`Mapped ${mappedProducts.length} products`);
        return mappedProducts;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error : new Error('Unknown error fetching products'));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengambil data produk",
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
