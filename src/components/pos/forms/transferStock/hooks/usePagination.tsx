
import { useState, useEffect } from "react";
import { ProductWithSelection } from "@/types/pos";

export const usePagination = (items: ProductWithSelection[], itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedItems, setPaginatedItems] = useState<ProductWithSelection[]>([]);

  useEffect(() => {
    if (items.length === 0) {
      setTotalPages(1);
      setPaginatedItems([]);
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
    setPaginatedItems(items.slice(startIndex, endIndex));
  }, [items, currentPage, itemsPerPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToNextPage,
    goToPreviousPage,
    goToPage
  };
};
