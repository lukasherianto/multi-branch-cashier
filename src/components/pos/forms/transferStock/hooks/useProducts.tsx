import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection } from "@/types/pos";
import { useAuth } from "@/hooks/auth";

export const useProducts = (sourceBranchId: string) => {
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const [allProducts, setAllProducts] = useState<ProductWithSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const { pelakuUsaha } = useAuth();
  
  useEffect(() => {
    const fetchProductsForBranch = async () => {
      if (!sourceBranchId || !pelakuUsaha) {
        console.log("Missing sourceBranchId or pelakuUsaha, skipping fetch");
        setFilteredProducts([]);
        setAllProducts([]);
        return;
      }
      
      console.log(`Fetching products for branch ID: ${sourceBranchId}`);
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
          .eq('cabang_id', parseInt(sourceBranchId))
          .gt('stock', 0);
          
        if (error) {
          console.error("Error fetching products:", error);
          throw error;
        }
        
        console.log(`Found ${productsData ? productsData.length : 0} products for branch ${sourceBranchId}`);
        console.log("Products data:", productsData);
        
        const mappedProducts = productsData ? productsData.map(product => ({
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
        })) : [];
        
        setFilteredProducts(mappedProducts);
        setAllProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products for branch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductsForBranch();
  }, [sourceBranchId, pelakuUsaha]);
  
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(allProducts);
      return;
    }
    
    const searchTerms = query.toLowerCase().split(" ");
    
    const results = allProducts.filter(product => {
      const productName = product.name.toLowerCase();
      const productBarcode = product.barcode?.toLowerCase() || "";
      
      return searchTerms.every(term => 
        productName.includes(term) || productBarcode.includes(term)
      );
    });
    
    setFilteredProducts(results);
    console.log(`Search for "${query}" found ${results.length} products`);
  };
  
  return {
    filteredProducts,
    setFilteredProducts,
    allProducts,
    loading,
    handleSearch
  };
};
