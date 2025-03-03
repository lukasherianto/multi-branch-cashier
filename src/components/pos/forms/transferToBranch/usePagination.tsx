
import { useState } from "react";
import { ProductWithSelection } from "@/types/pos";

export const usePagination = (products: ProductWithSelection[] = [], itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Get paginated products for current page
  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };
  
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
    paginatedProducts: getPaginatedProducts(),
    handleNextPage,
    handlePreviousPage,
    ITEMS_PER_PAGE: itemsPerPage
  };
};
