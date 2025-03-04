
import { useState, useEffect } from "react";
import { ProductWithSelection } from "@/types/pos";
import { useProducts } from "./useProducts";
import { useToast } from "@/hooks/use-toast";

export const useProductManagement = (sourceBranchId: string) => {
  const [selectedProducts, setSelectedProducts] = useState<ProductWithSelection[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<ProductWithSelection[]>([]);
  const ITEMS_PER_PAGE = 10;
  const { toast } = useToast();

  // Get products for the selected source branch
  const { 
    filteredProducts, 
    allProducts,
    loading: productsLoading, 
    error,
    handleSearch,
    setFilteredProducts 
  } = useProducts(sourceBranchId);

  // Log any errors from the products hook
  useEffect(() => {
    if (error) {
      console.error("Error in useProducts hook:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data produk: " + error.message,
      });
    }
  }, [error, toast]);

  // Log when sourceBranchId changes
  useEffect(() => {
    console.log("ProductManagement - sourceBranchId changed:", sourceBranchId);
  }, [sourceBranchId]);

  // Update paginated products when currentPage or filteredProducts change
  useEffect(() => {
    if (!filteredProducts || filteredProducts.length === 0) {
      console.log("No filtered products available for pagination");
      setPaginatedProducts([]);
      return;
    }
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    console.log(`Updating paginated products: ${startIndex}-${endIndex} of ${filteredProducts.length}`);
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [currentPage, filteredProducts]);

  // Update selectedProducts when filteredProducts change
  useEffect(() => {
    console.log("Setting selectedProducts from filteredProducts:", filteredProducts?.length || 0);
    setSelectedProducts(filteredProducts || []);
  }, [filteredProducts]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil((filteredProducts?.length || 0) / ITEMS_PER_PAGE));

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Handle product selection
  const handleProductSelection = (productId: number, selected: boolean) => {
    console.log(`Selection change for product ${productId}: ${selected}`);
    const updatedProducts = filteredProducts.map(product => 
      product.id === productId ? { ...product, selected } : product
    );
    setFilteredProducts(updatedProducts);
  };

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    console.log(`Quantity change for product ${productId}: ${quantity}`);
    const updatedProducts = filteredProducts.map(product => 
      product.id === productId ? { ...product, quantity } : product
    );
    setFilteredProducts(updatedProducts);
  };

  return {
    selectedProducts,
    paginatedProducts,
    productsLoading,
    currentPage,
    totalPages,
    ITEMS_PER_PAGE,
    handleSearch,
    handlePreviousPage,
    handleNextPage,
    handleProductSelection,
    handleQuantityChange,
    filteredProducts
  };
};
