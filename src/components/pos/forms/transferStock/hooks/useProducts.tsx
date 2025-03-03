
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection } from "@/types/pos";
import { useAuth } from "@/hooks/useAuth";

export const useProducts = (sourceBranchId?: string) => {
  const [products, setProducts] = useState<ProductWithSelection[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const { pelakuUsahaId } = useAuth();

  // Fetch products for a specific branch
  useEffect(() => {
    const fetchBranchProducts = async () => {
      if (!sourceBranchId || !pelakuUsahaId) {
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
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
          .eq('pelaku_usaha_id', pelakuUsahaId)
          .eq('cabang_id', parseInt(sourceBranchId))
          .gt('stock', 0); // Only products with stock > 0
          
        if (error) throw error;
        
        if (data) {
          const mappedProducts: ProductWithSelection[] = data.map(product => ({
            id: product.produk_id,
            name: product.product_name,
            price: product.retail_price,
            member_price_1: product.member_price_1,
            member_price_2: product.member_price_2,
            quantity: 1,
            category: product.kategori_produk?.kategori_name,
            stock: product.stock,
            barcode: product.barcode || "",
            unit: product.unit,
            cost_price: product.cost_price,
            cabang_id: product.cabang_id,
            selected: false
          }));
          
          setProducts(mappedProducts);
          setFilteredProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Error fetching branch products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBranchProducts();
  }, [sourceBranchId, pelakuUsahaId]);

  // Search products
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm)) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
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
