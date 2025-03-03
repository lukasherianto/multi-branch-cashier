
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  produk_id: number;
  product_name: string;
  stock: number;
  selected: boolean;
  quantity: number;
}

export function useProducts(sourceBranchId: string | null) {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch products for specific branch
  useEffect(() => {
    if (sourceBranchId === null) {
      console.log("No source branch selected yet");
      return;
    }
    
    console.log("Branch ID changed in useProducts:", sourceBranchId);
    fetchProducts(sourceBranchId);
  }, [sourceBranchId]);

  const fetchProducts = async (branchId: string | null) => {
    if (!branchId) {
      console.log("No branch ID provided, not fetching products");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching products for branch ID:", branchId);

      const { data: userResponse } = await supabase.auth.getUser();
      
      if (!userResponse.user) {
        console.error("No authenticated user");
        setSelectedProducts([]);
        setFilteredProducts([]);
        return;
      }

      const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', userResponse.user.id)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error("Error fetching pelaku usaha:", pelakuUsahaError);
        throw pelakuUsahaError;
      }

      if (!pelakuUsaha) {
        console.log("No pelaku usaha found");
        setSelectedProducts([]);
        setFilteredProducts([]);
        return;
      }

      const { data: products, error: productsError } = await supabase
        .from('produk')
        .select(`
          produk_id,
          product_name,
          stock
        `)
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

      if (productsError) {
        console.error("Error fetching products:", productsError);
        throw productsError;
      }

      if (products && products.length > 0) {
        const productsWithSelection = products.map((product) => ({
          ...product,
          selected: false,
          quantity: 1
        }));
        console.log(`Found ${productsWithSelection.length} products for branch ${branchId}`);
        setSelectedProducts(productsWithSelection);
        setFilteredProducts(productsWithSelection);
      } else {
        console.log(`No products found for branch ${branchId}`);
        setSelectedProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error("Error in fetchProducts:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch products"));
      toast({
        title: "Error",
        description: "Tidak dapat memuat data produk",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product selection
  const handleProductSelection = (produk_id: number, checked: boolean) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.produk_id === produk_id
          ? { ...product, selected: checked }
          : product
      )
    );
    // Update filtered products too
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.produk_id === produk_id
          ? { ...product, selected: checked }
          : product
      )
    );
  };

  // Handle quantity change
  const handleQuantityChange = (produk_id: number, quantity: number) => {
    if (quantity < 0) {
      return; // Don't allow negative quantities
    }
    
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.produk_id === produk_id
          ? { ...product, quantity: Math.min(quantity, product.stock) }
          : product
      )
    );
    // Update filtered products too
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.produk_id === produk_id
          ? { ...product, quantity: Math.min(quantity, product.stock) }
          : product
      )
    );
  };

  // Handle product search
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(selectedProducts);
      return;
    }

    const filtered = selectedProducts.filter(
      (product) =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);

    if (searchTerm.length > 2 && filtered.length === 0) {
      toast({
        title: "Produk Tidak Ditemukan",
        description: "Tidak ada produk dengan nama tersebut",
        variant: "destructive",
      });
    }
  };

  return {
    selectedProducts,
    filteredProducts,
    isLoading,
    error,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    setSelectedProducts,
    fetchProducts
  };
}
