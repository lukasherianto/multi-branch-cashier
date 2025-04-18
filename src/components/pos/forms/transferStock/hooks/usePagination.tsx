
import { useState, useEffect } from "react";
import { ProductWithSelection } from "@/types/pos";

const ITEMS_PER_PAGE = 10;

export const useProductsWithPagination = (items: ProductWithSelection[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<ProductWithSelection[]>([]);
  
  // Calculate total pages
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  
  // Update paginated products when items or currentPage changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedProducts(items.slice(startIndex, endIndex));
    
    // Reset to page 1 if the current page would be out of bounds
    if (currentPage > 1 && items.length <= (currentPage - 1) * ITEMS_PER_PAGE) {
      setCurrentPage(1);
    }
  }, [items, currentPage]);
  
  // Go to next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
