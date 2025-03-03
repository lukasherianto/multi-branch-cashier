
import { useState, useEffect } from "react";
import { ProductWithSelection } from "./useProducts";

export const usePagination = (
  filteredProducts: ProductWithSelection[], 
  itemsPerPage: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<ProductWithSelection[]>([]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Update paginated products when filtered products or page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
    
    // If current page is now greater than total pages, reset to page 1
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredProducts, currentPage, totalPages, itemsPerPage]);
  
  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  return {
    currentPage,
    totalPages,
    paginatedProducts,
    handleNextPage,
    handlePreviousPage
  };
};
