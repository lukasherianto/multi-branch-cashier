
import { useEffect, useState } from "react";
import { useProductData } from "./useProductData";
import { useProductSearch } from "./useProductSearch";
import { CartItem } from "@/types/pos";

export const useProducts = () => {
  const { products, setProducts, loading, error, fetchProducts } = useProductData();
  const { filteredProducts, setFilteredProducts, handleSearch } = useProductSearch(products);
  const [currentBranchId, setCurrentBranchId] = useState<number | null>(null);

  const loadProducts = async (branchId?: number | null) => {
    setCurrentBranchId(branchId || null);
    const fetchedProducts = await fetchProducts(branchId);
    setProducts(fetchedProducts);
    setFilteredProducts(fetchedProducts);
    return fetchedProducts;
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  return { 
    products, 
    filteredProducts, 
    handleSearch, 
    fetchProducts: loadProducts,
    loading,
    error,
    currentBranchId,
    setFilteredProducts
  };
};
