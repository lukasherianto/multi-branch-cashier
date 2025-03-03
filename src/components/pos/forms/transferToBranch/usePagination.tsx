
import { useState, useEffect } from "react";
import { ProductWithSelection } from "@/types/pos";

export const usePagination = (items: ProductWithSelection[], itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<ProductWithSelection[]>([]);

  useEffect(() => {
    if (items.length === 0) {
      setTotalPages(1);
      setPaginatedProducts([]);
      return;
    }

    const calculatedTotalPages = Math.ceil(items.length / itemsPerPage);
    setTotalPages(calculatedTotalPages);

    // Reset currentPage if it's beyond the new total pages
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(items.slice(startIndex, endIndex));
  }, [items, currentPage, itemsPerPage]);

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

  return {
    currentPage,
    totalPages,
    paginatedProducts,
    handleNextPage,
    handlePreviousPage,
    ITEMS_PER_PAGE: itemsPerPage
  };
};
