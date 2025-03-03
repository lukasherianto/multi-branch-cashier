
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type ProductTransfer } from "../schema";

export function useProducts(branchId: string | null) {
  const [selectedProducts, setSelectedProducts] = useState<ProductTransfer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products when branch changes
  useEffect(() => {
    if (branchId) {
      fetchProductsForBranch(branchId);
    } else {
      setSelectedProducts([]);
    }
  }, [branchId]);

  // Fetch products for a specific branch
  const fetchProductsForBranch = async (branchId: string) => {
    try {
      console.log(`Fetching products for branch ID: ${branchId}`);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        console.error("No authenticated user found");
        return;
      }

      const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (pelakuUsahaError || !pelakuUsaha) {
        console.error("Error fetching pelaku usaha:", pelakuUsahaError);
        return;
      }

      // Get all products for this branch with stock > 0
      const { data: branchProducts, error: productsError } = await supabase
        .from('produk')
        .select(`
          produk_id,
          product_name,
          stock
        `)
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
        .gt('stock', 0);

      if (productsError) {
        console.error("Error fetching products:", productsError);
        return;
      }

      console.log(`Found ${branchProducts?.length || 0} products for branch ${branchId}`);
      
      // Map products to the required format
      const formattedProducts: ProductTransfer[] = (branchProducts || []).map(product => ({
        produk_id: product.produk_id,
        product_name: product.product_name,
        stock: product.stock,
        quantity: 0,
        selected: false
      }));

      setSelectedProducts(formattedProducts);
    } catch (error) {
      console.error("Error in fetchProductsForBranch:", error);
    }
  };

  // Handle product search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Filter products by search term
  const filteredProducts = selectedProducts.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle product selection
  const handleProductSelection = (productId: number) => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.produk_id === productId) {
          return {
            ...product,
            selected: !product.selected,
            quantity: !product.selected && product.quantity === 0 ? 1 : product.quantity
          };
        }
        return product;
      })
    );
  };

  // Update product quantity
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.produk_id === productId) {
          return {
            ...product,
            quantity: Math.min(newQuantity, product.stock),
            selected: newQuantity > 0
          };
        }
        return product;
      })
    );
  };

  return {
    selectedProducts,
    setSelectedProducts,
    filteredProducts,
    handleSearch,
    handleProductSelection,
    handleQuantityChange
  };
}
