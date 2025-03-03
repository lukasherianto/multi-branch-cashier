
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";

export const useProductData = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = async (branchId?: string | null) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching products for branch ID: ${branchId || 'all'}`);
      
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (pelakuUsahaData) {
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
            kategori_produk (
              kategori_name
            )
          `)
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

        // If a branch ID is specified, fetch branch-specific products
        // This would normally involve some relationship or filter based on your schema
        // For now, fetching all products as an example
        const { data: productsData, error } = await query;

        if (error) throw error;

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
            cost_price: product.cost_price
          }));
          
          console.log(`Found ${mappedProducts.length} products${branchId ? ` for branch ${branchId}` : ''}`);
          
          return mappedProducts;
        }
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
