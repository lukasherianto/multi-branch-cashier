
import { useState } from "react";
import { type ProductTransfer, ITEMS_PER_PAGE } from "../schema";

export function usePagination(filteredProducts: ProductTransfer[]) {
  const [currentPage, setCurrentPage] = useState(0);
  
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  
  const paginatedProducts = filteredProducts.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };
  
  // Reset page when filtered products change
  const resetPage = () => {
    setCurrentPage(0);
  };

  return {
    currentPage,
    totalPages,
    paginatedProducts,
    handlePreviousPage,
    handleNextPage,
    resetPage
  };
}
