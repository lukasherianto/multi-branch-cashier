
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./schema";
import { TransferStockFormValues } from "@/types/pos";
import { useBranchManagement } from "./hooks/useBranchManagement";
import { useProductManagement } from "./hooks/useProductManagement";
import { useTransferSubmit } from "./hooks/useTransferSubmit";

export const useTransferStock = () => {
  // Initialize the form - this should always be called
  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cabang_id_from: "",
      cabang_id_to: "",
      products: [],
      notes: ""
    }
  });

  // Watch for source branch changes to load products - always call this
  const sourceBranchId = form.watch("cabang_id_from");
  console.log("Current source branch ID:", sourceBranchId);
  
  // Custom hooks - always call these in the same order
  const branchManagement = useBranchManagement(form);
  const productManagement = useProductManagement(sourceBranchId);
  const transferSubmit = useTransferSubmit(form, productManagement.filteredProducts, branchManagement.centralBranch, branchManagement.fromCentralToBranch);

  // Destructure values from the hooks
  const {
    branchesLoading,
    cabangList,
    centralBranch,
    sourceBranches,
    destinationBranches,
    fromCentralToBranch,
    toggleDirection
  } = branchManagement;

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
  } = productManagement;

  const {
    isSubmitting,
    onSubmit
  } = transferSubmit;

  // Return all the values and functions
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
