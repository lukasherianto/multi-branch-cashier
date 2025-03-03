
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection } from "@/types/pos";
import { useAuth } from "@/hooks/useAuth";

export const useProducts = (sourceBranchId: string) => {
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const { pelakuUsaha } = useAuth();
  
  // Load products for the source branch when branchId changes
  useEffect(() => {
    const fetchProductsForBranch = async () => {
      if (!sourceBranchId || !pelakuUsaha) return;
      
      setLoading(true);
      try {
        const { data: productsData, error } = await supabase
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
        
        const mappedProducts = productsData.map(product => ({
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
        
        setFilteredProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products for branch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductsForBranch();
  }, [sourceBranchId, pelakuUsaha]);
  
  // Search filter function
  const handleSearch = (query: string) => {
    setFilteredProducts(prev => {
      if (!query) return prev;
      
      const searchTerms = query.toLowerCase().split(" ");
      
      return prev.filter(product => {
        const productName = product.name.toLowerCase();
        const productBarcode = product.barcode?.toLowerCase() || "";
        
        return searchTerms.every(term => 
          productName.includes(term) || productBarcode.includes(term)
        );
      });
    });
  };
  
  return {
    filteredProducts,
    setFilteredProducts,
    loading,
    handleSearch
  };
};
