
import { useEffect, useState } from "react";
import { useProductData } from "./useProductData";
import { useProductSearch } from "./useProductSearch";
import { CartItem } from "@/types/pos";
import { useAuth } from "@/hooks/auth";

export const useProducts = () => {
  const { products, setProducts, loading, error, fetchProducts } = useProductData();
  const { filteredProducts, setFilteredProducts, handleSearch } = useProductSearch(products);
  const [currentBranchId, setCurrentBranchId] = useState<number | null>(null);
  const { selectedCabangId, pelakuUsaha } = useAuth();

  const loadProducts = async (branchId?: number | null) => {
    console.log("loadProducts called with branchId:", branchId);
    setCurrentBranchId(branchId || null);
    const fetchedProducts = await fetchProducts(branchId);
    setProducts(fetchedProducts);
    setFilteredProducts(fetchedProducts);
    console.log("Loaded products:", fetchedProducts.length);
    return fetchedProducts;
  };

  // Memuat produk ketika komponen dimount atau selectedCabangId berubah
  useEffect(() => {
    if (pelakuUsaha) {
      console.log("Loading products based on selectedCabangId:", selectedCabangId);
      loadProducts(selectedCabangId);
    }
  }, [selectedCabangId, pelakuUsaha]);

  // Sync filteredProducts dengan products ketika products berubah
  useEffect(() => {
    setFilteredProducts(products);
  }, [products, setFilteredProducts]);

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
