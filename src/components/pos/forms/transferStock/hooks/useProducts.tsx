
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection } from "@/types/pos";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useProducts = (sourceBranchId?: string) => {
  const { toast } = useToast();
  const { pelakuUsaha } = useAuth();
  const [products, setProducts] = useState<ProductWithSelection[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!sourceBranchId || !pelakuUsaha?.pelaku_usaha_id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
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
          .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
          .eq('cabang_id', parseInt(sourceBranchId));

        if (error) throw error;

        const mappedProducts = (data || []).map(product => ({
          id: product.produk_id,
          produk_id: product.produk_id,
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
          cabang_id: product.cabang_id,
          selected: false
        }));

        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal mengambil data produk",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sourceBranchId, pelakuUsaha, toast]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  return { 
    products, 
    filteredProducts, 
    loading, 
    handleSearch,
    setFilteredProducts 
  };
};

export type ProductWithSelection = {
  id: number;
  produk_id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  cost_price: number;
  cabang_id: number;
  member_price_1?: number | null;
  member_price_2?: number | null;
  category?: string;
  barcode?: string;
  unit: string;
  selected: boolean;
};
