
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferStockSchema, type TransferStockFormValues } from "./schema";
import { useBranchSelection } from "./hooks/useBranchSelection";
import { useProducts } from "./hooks/useProducts";
import { usePagination } from "./hooks/usePagination";
import { useTransferSubmit } from "./utils/transferUtils";
import { useToast } from "@/hooks/use-toast";

export function useTransferStock() {
  const { toast } = useToast();
  
  // Initialize form with zod validation
  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      cabang_id_from: "",
      cabang_id_to: "",
      products: []
    }
  });

  // Use the branch selection hook for all branch-related state and logic
  const {
    fromCentralToBranch,
    toggleDirection,
    sourceBranchId,
    sourceBranches,
    destinationBranches,
    branches,
    branchesLoading,
    centralBranch
  } = useBranchSelection(form);

  // Use the products hook for product selection and management
  const {
    selectedProducts,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    setSelectedProducts,
  } = useProducts(sourceBranchId);

  // Use pagination hook for managing paginated data display
  const {
    currentPage,
    totalPages,
    paginatedProducts,
    handleNextPage,
    handlePreviousPage,
    ITEMS_PER_PAGE
  } = usePagination(selectedProducts);

  // Use the submission hook for handling form submissions
  const { isSubmitting, submitTransfer } = useTransferSubmit();

  // Handle form submission
  const onSubmit = async (values: TransferStockFormValues) => {
    try {
      console.log("Submitting transfer with values:", values);
      
      // Validate that both source and destination are selected
      if (!values.cabang_id_from || !values.cabang_id_to) {
        toast({
          title: "Error",
          description: "Pilih cabang asal dan tujuan",
          variant: "destructive",
        });
        return;
      }

      // Validate that source and destination are different
      if (values.cabang_id_from === values.cabang_id_to) {
        toast({
          title: "Error",
          description: "Cabang asal dan tujuan tidak boleh sama",
          variant: "destructive",
        });
        return;
      }

      // Add selected products to form data
      const productsWithSelection = selectedProducts
        .filter((product) => product.selected)
        .map((product) => ({
          produk_id: product.produk_id,
          quantity: product.quantity,
          selected: product.selected,
        }));

      console.log("Products to transfer:", productsWithSelection);

      if (productsWithSelection.length === 0) {
        toast({
          title: "Error",
          description: "Pilih minimal satu produk",
          variant: "destructive",
        });
        return;
      }

      // Submit the transfer
      await submitTransfer(
        values,
        selectedProducts,
        values.cabang_id_from,
        () => {
          // Reset form
          form.reset({
            cabang_id_from: fromCentralToBranch ? centralBranch?.cabang_id.toString() : "",
            cabang_id_to: !fromCentralToBranch ? centralBranch?.cabang_id.toString() : "",
            products: []
          });
          setSelectedProducts([]);
        }
      );
    } catch (error) {
      console.error("Error in transfer submission:", error);
      toast({
        title: "Error",
        description: "Gagal melakukan transfer stok",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    isSubmitting,
    branchesLoading,
    branches,
    centralBranch,
    sourceBranches,
    destinationBranches,
    fromCentralToBranch,
    toggleDirection,
    selectedProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    handlePreviousPage,
    handleNextPage,
    onSubmit,
    ITEMS_PER_PAGE
  };
}
