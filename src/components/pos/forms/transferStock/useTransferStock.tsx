
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./schema";
import { TransferStockFormValues } from "@/types/pos";
import { useBranchManagement } from "./hooks/useBranchManagement";
import { useProductManagement } from "./hooks/useProductManagement";
import { useTransferSubmit } from "./hooks/useTransferSubmit";

export const useTransferStock = () => {
  // Initialize the form
  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cabang_id_from: "",
      cabang_id_to: "",
      products: [],
      notes: ""
    }
  });

  // Watch for source branch changes to load products
  const sourceBranchId = form.watch("cabang_id_from");
  console.log("Current source branch ID:", sourceBranchId);
  
  // Get branch management functionality
  const {
    branchesLoading,
    cabangList,
    centralBranch,
    sourceBranches,
    destinationBranches,
    fromCentralToBranch,
    toggleDirection
  } = useBranchManagement(form);

  // Get product management functionality
  const {
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
  } = useProductManagement(sourceBranchId);

  // Get form submission functionality
  const {
    isSubmitting,
    onSubmit
  } = useTransferSubmit(form, filteredProducts, centralBranch, fromCentralToBranch);

  return {
    form,
    onSubmit,
    branchesLoading,
    productsLoading,
    isSubmitting,
    cabangList,
    centralBranch,
    sourceBranches,
    destinationBranches,
    fromCentralToBranch,
    toggleDirection,
    selectedProducts,
    paginatedProducts,
    handleSearch,
    currentPage,
    totalPages,
    handlePreviousPage,
    handleNextPage,
    ITEMS_PER_PAGE,
    handleProductSelection,
    handleQuantityChange
  };
};
