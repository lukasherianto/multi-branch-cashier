
import { useEffect } from "react";
import { useProductData } from "./useProductData";
import { useProductSearch } from "./useProductSearch";

export const useProducts = () => {
  const { products, setProducts, loading, error, fetchProducts } = useProductData();
  const { filteredProducts, setFilteredProducts, handleSearch } = useProductSearch(products);

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    };
    
    loadProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  return { 
    products, 
    filteredProducts, 
    handleSearch, 
    fetchProducts,
    loading,
    error
  };
};
