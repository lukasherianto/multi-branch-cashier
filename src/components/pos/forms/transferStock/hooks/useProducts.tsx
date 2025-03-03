
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

      // Also check transfer history to find products that were transferred to this branch
      const { data: transferredProducts, error: transferError } = await supabase
        .from('transfer_stok')
        .select(`
          produk_id,
          quantity
        `)
        .eq('cabang_id_to', parseInt(branchId));

      if (transferError) {
        console.error("Error fetching transfer history:", transferError);
      }

      // Get product details for both stock and transferred products
      const { data: branchProducts, error: productsError } = await supabase
        .from('produk')
        .select(`
          produk_id,
          product_name,
          stock
        `)
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

      if (productsError) {
        console.error("Error fetching products:", productsError);
        return;
      }

      // Map products to the required format, filtering for products with stock > 0
      // For branch to central transfers, we want to show all products that exist in this branch
      const formattedProducts: ProductTransfer[] = (branchProducts || [])
        .filter(product => product.stock > 0)
        .map(product => ({
          produk_id: product.produk_id,
          product_name: product.product_name,
          stock: product.stock,
          quantity: 0,
          selected: false
        }));

      console.log(`Found ${formattedProducts.length} products for branch ${branchId}`);
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
  const handleProductSelection = (productId: number, checked: boolean) => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.produk_id === productId) {
          return {
            ...product,
            selected: checked,
            quantity: checked && product.quantity === 0 ? 1 : product.quantity
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
