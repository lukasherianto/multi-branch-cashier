
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductWithSelection } from "@/types/pos";

export const useCentralProducts = (centralBranchId?: number) => {
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products from central branch
  useEffect(() => {
    const fetchProducts = async () => {
      if (!centralBranchId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("produk")
          .select("*")
          .eq("cabang_id", centralBranchId);
          
        if (error) throw error;
        
        // Map products to include selection and quantity
        const mappedProducts = data.map(product => ({
          id: product.produk_id,
          produk_id: product.produk_id,
          name: product.product_name,
          price: product.retail_price,
          cost_price: product.cost_price,
          member_price_1: product.member_price_1,
          member_price_2: product.member_price_2,
          stock: product.stock,
          barcode: product.barcode,
          unit: product.unit,
          cabang_id: product.cabang_id,
          quantity: 1, // Default quantity
          selected: false // Default selection state
        }));
        
        setFilteredProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Error loading products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [centralBranchId]);

  // Search handler
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Product selection handler
  const handleProductSelection = (productId: number, selected: boolean) => {
    setFilteredProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, selected } 
          : product
      )
    );
  };

  // Quantity change handler
  const handleQuantityChange = (productId: number, quantity: number) => {
    setFilteredProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, quantity } 
          : product
      )
    );
  };

  // Filter products based on search term
  useEffect(() => {
    // No need to filter if no search term
    if (!searchTerm.trim()) return;
    
    const filtered = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm]);

  return {
    filteredProducts,
    loading,
    handleSearch,
    handleProductSelection,
    handleQuantityChange
  };
};
