
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type ProductTransfer } from "../schema";

export function useProducts(pelakuUsaha: any, centralBranchId: string | null) {
  const [selectedProducts, setSelectedProducts] = useState<ProductTransfer[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductTransfer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ['products', pelakuUsaha?.pelaku_usaha_id, centralBranchId],
    queryFn: async () => {
      if (!pelakuUsaha || !centralBranchId) return [];
      const { data } = await supabase
        .from('produk')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
        .order('product_name', { ascending: true });
      
      if (data) {
        const productTransfers = data.map(product => ({
          produk_id: product.produk_id,
          quantity: 0,
          selected: false,
          product_name: product.product_name,
          stock: product.stock
        }));
        setSelectedProducts(productTransfers);
        setFilteredProducts(productTransfers);
      }
      
      return data || [];
    },
    enabled: !!pelakuUsaha && !!centralBranchId,
  });

  useEffect(() => {
    handleSearch(searchTerm);
  }, [selectedProducts, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredProducts(selectedProducts);
      return;
    }

    const filtered = selectedProducts.filter(product => 
      product.product_name.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  };

  const handleProductSelection = (produk_id: number, checked: boolean) => {
    setSelectedProducts(prev => prev.map(p => 
      p.produk_id === produk_id ? { ...p, selected: checked } : p
    ));
  };

  const handleQuantityChange = (produk_id: number, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => 
      p.produk_id === produk_id ? { ...p, quantity } : p
    ));
  };

  return {
    products,
    selectedProducts,
    filteredProducts,
    searchTerm,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    setFilteredProducts
  };
}
