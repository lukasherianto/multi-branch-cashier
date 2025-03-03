
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferToBranchSchema, type TransferToBranchFormValues } from "./schema";
import { useBranches } from "../transferStock/hooks/useBranches";
import { useCentralProducts } from "./useCentralProducts";
import { usePagination } from "./usePagination";
import { useToast } from "@/hooks/use-toast";
import { useTransferToBranchSubmit } from "./transferToBranchUtils";

export function useTransferToBranch() {
  const { toast } = useToast();
  
  // Initialize form with zod validation
  const form = useForm<TransferToBranchFormValues>({
    resolver: zodResolver(transferToBranchSchema),
    defaultValues: {
      cabang_id_to: "",
      products: []
    }
  });

  // Get branches data
  const { branches, centralBranch, branchesLoading } = useBranches();
  
  // Central branch is the source branch (fixed in this component)
  const sourceBranchId = centralBranch?.cabang_id.toString() || null;
  
  // Destination branches exclude the central branch
  const destinationBranches = branches.filter(b => b.cabang_id !== centralBranch?.cabang_id) || [];

  // Get central products
  const {
    selectedProducts,
    filteredProducts,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    setSelectedProducts,
    isLoading: productsLoading
  } = useCentralProducts(sourceBranchId);

  // Use pagination hook for managing paginated data display
  const {
    currentPage,
    totalPages,
    paginatedProducts,
    handleNextPage,
    handlePreviousPage,
    ITEMS_PER_PAGE
  } = usePagination(filteredProducts);

  // Use the submission hook for handling form submissions
  const { isSubmitting, submitTransfer } = useTransferToBranchSubmit();

  // Calculate total cost price for selected products
  const totalCostPrice = selectedProducts
    .filter(p => p.selected)
    .reduce((total, product) => total + (product.cost_price * product.quantity), 0);

  // Handle form submission
  const onSubmit = async (values: TransferToBranchFormValues) => {
    try {
      console.log("Submitting transfer with values:", values);
      
      // Validate that destination branch is selected
      if (!values.cabang_id_to) {
        toast({
          title: "Error",
          description: "Pilih cabang tujuan",
          variant: "destructive",
        });
        return;
      }

      // Validate that source branch (central) exists
      if (!sourceBranchId) {
        toast({
          title: "Error",
          description: "Cabang pusat tidak terdeteksi",
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
        sourceBranchId,
        () => {
          // Reset form
          form.reset({
            cabang_id_to: "",
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
    productsLoading,
    branches,
    centralBranch,
    destinationBranches,
    selectedProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    totalCostPrice,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    handlePreviousPage,
    handleNextPage,
    onSubmit,
    ITEMS_PER_PAGE
  };
}
