
import { useState, useEffect } from "react";
import { ProductWithSelection } from "./useCentralProducts";

export const usePagination = (products: ProductWithSelection[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<ProductWithSelection[]>([]);
  
  const ITEMS_PER_PAGE = 10;
  
  // Calculate total pages
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  
  // Update paginated products when products or page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedProducts(products.slice(startIndex, endIndex));
    
    // If current page is now greater than total pages, reset to page 1
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [products, currentPage, totalPages]);
  
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
    handlePreviousPage,
    ITEMS_PER_PAGE
  };
};
