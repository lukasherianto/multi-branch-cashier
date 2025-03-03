
import { useState, useEffect } from "react";
import { ITEMS_PER_PAGE } from "./schema";
import { type ProductTransfer } from "./schema";

export function usePagination(products: ProductTransfer[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<ProductTransfer[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Calculate total pages based on items per page
    const total = Math.ceil(products.length / ITEMS_PER_PAGE);
    setTotalPages(total || 1);

    // Ensure current page is within bounds when total pages changes
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }

    // Get products for current page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = products.slice(startIndex, endIndex);
    
    setPaginatedProducts(paginatedItems);
  }, [products, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
}
