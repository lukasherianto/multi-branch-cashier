
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCentralProducts } from "./useCentralProducts";
import { usePagination } from "./usePagination";
import { transferToBranchSchema } from "./schema";
import { transferProductsToBranch, TransferToBranchValues } from "./transferToBranchUtils";
import { z } from "zod";

export type TransferFormValues = z.infer<typeof transferToBranchSchema>;

export const useTransferToBranch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [transferId, setTransferId] = useState<number | null>(null);
  const { cabangList } = useAuth();
  
  // Sort branches by ID (lowest first is headquarters)
  const sortedBranches = [...cabangList].sort((a, b) => a.cabang_id - b.cabang_id);
  const centralBranchId = sortedBranches.length > 0 ? sortedBranches[0].cabang_id : null;
  const branchOptions = sortedBranches
    .filter(branch => branch.cabang_id !== centralBranchId)
    .map(branch => ({
      value: branch.cabang_id.toString(),
      label: branch.branch_name
    }));

  // Form setup
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferToBranchSchema),
    defaultValues: {
      cabang_id_to: branchOptions.length > 0 ? branchOptions[0].value : "",
      notes: ""
    }
  });

  // Get central products
  const { 
    products, 
    filteredProducts, 
    loading, 
    handleSearch,
    handleProductSelection,
    handleQuantityChange
  } = useCentralProducts(centralBranchId || 0);

  // Define a convenience variable for selected products
  const selectedProducts = filteredProducts.filter(p => p.selected);

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToNextPage,
    goToPreviousPage
  } = usePagination(
    searchTerm
      ? filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : filteredProducts,
    ITEMS_PER_PAGE
  );

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleSearch(value);
  };

  // Handle form submission
  const onSubmit = async (data: TransferFormValues) => {
    if (!centralBranchId) {
      toast("Error: No central branch found");
      return;
    }

    try {
      setTransferring(true);
      const result = await transferProductsToBranch(
        data,
        centralBranchId,
        filteredProducts
      );

      if (result) {
        setTransferId(result);
        toast(`Transfer berhasil dengan ID: ${result}`);
        form.reset();
        // Reset product selection
        const resetProducts = filteredProducts.map(p => ({ ...p, selected: false, quantity: 1 }));
        // This will be defined in the useCentralProducts hook
        handleSearch("");
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setTransferring(false);
    }
  };

  return {
    form,
    branchOptions,
    centralBranchId,
    products,
    filteredProducts,
    selectedProducts,
    paginatedItems,
    currentPage,
    totalPages,
    loading,
    transferring,
    transferId,
    handleSearchChange,
    handleProductSelection,
    handleQuantityChange,
    goToNextPage,
    goToPreviousPage,
    onSubmit,
    ITEMS_PER_PAGE
  };
};
