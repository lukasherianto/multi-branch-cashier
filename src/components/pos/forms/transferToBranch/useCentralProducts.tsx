
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection } from "@/types/pos";
import { useAuth } from "@/hooks/useAuth";

export const useCentralProducts = (centralBranchId: number | null) => {
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const { pelakuUsaha } = useAuth();
  
  // Load products for the central branch when branchId changes
  useEffect(() => {
    const fetchCentralProducts = async () => {
      if (!centralBranchId || !pelakuUsaha) return;
      
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
          .eq('cabang_id', centralBranchId);
          
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
        console.error("Error fetching products for central branch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCentralProducts();
  }, [centralBranchId, pelakuUsaha]);
  
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
  
  // Handle product selection
  const handleProductSelection = (productId: number, selected: boolean) => {
    setFilteredProducts(prev => 
      prev.map(product => 
        product.id === productId ? { ...product, selected } : product
      )
    );
  };
  
  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    setFilteredProducts(prev => 
      prev.map(product => 
        product.id === productId ? { ...product, quantity } : product
      )
    );
  };
  
  return {
    filteredProducts,
    loading,
    handleSearch,
    handleProductSelection,
    handleQuantityChange
  };
};
