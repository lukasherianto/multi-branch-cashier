
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useProducts, UseProductsReturn } from "./hooks/useProducts";
import { usePagination } from "./hooks/usePagination";
import { useBranchSelection, UseBranchSelectionReturn } from "./hooks/useBranchSelection";
import { transferStockSchema } from "./schema";
import { executeStockTransfer, validateStockForTransfer } from "./utils/transferUtils";
import { ProductWithSelection } from "@/types/pos";

export type TransferStockFormValues = z.infer<typeof transferStockSchema>;

export const useTransferStock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const [transferId, setTransferId] = useState<number | null>(null);
  const [direction, setDirection] = useState<"to-branch" | "to-headquarter">("to-branch");

  const branchSelection: UseBranchSelectionReturn = useBranchSelection(direction);
  const { 
    branchesLoading, 
    branches, 
    sourceBranches, 
    destinationBranches,
    fromCentralToBranch,
    sourceBranch,
    destinationBranch,
    toggleDirection,
    handleSourceBranchChange,
    handleDestinationBranchChange
  } = branchSelection;

  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      cabang_id_from: "",
      cabang_id_to: "",
    },
  });

  // Update form values when branches change
  useEffect(() => {
    if (sourceBranch) {
      form.setValue("cabang_id_from", sourceBranch.cabang_id.toString());
    }
    if (destinationBranch) {
      form.setValue("cabang_id_to", destinationBranch.cabang_id.toString());
    }
  }, [sourceBranch, destinationBranch, form]);

  // Get products based on the selected source branch
  const productsHook: UseProductsReturn = useProducts(
    sourceBranch?.cabang_id?.toString()
  );
  
  const { 
    filteredProducts, 
    loading: productsLoading, 
    handleSearch, 
    setFilteredProducts 
  } = productsHook;

  // Define a convenience variable for selected products
  const selectedProducts = filteredProducts;

  // Setup pagination
  const ITEMS_PER_PAGE = 10;
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProducts,
    goToNextPage: handleNextPage,
    goToPreviousPage: handlePreviousPage,
    goToPage,
  } = usePagination(
    searchTerm
      ? filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : filteredProducts,
    ITEMS_PER_PAGE
  );

  // Handle product selection
  const handleProductSelection = (productId: number, selected: boolean) => {
    const updatedProducts = filteredProducts.map((product) =>
      product.id === productId ? { ...product, selected } : product
    );
    
    setFilteredProducts(updatedProducts);
  };

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    const updatedProducts = filteredProducts.map((product) =>
      product.id === productId ? { ...product, quantity } : product
    );
    
    setFilteredProducts(updatedProducts);
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleSearch(value);
    goToPage(1); // Reset to first page when searching
  };

  // Handle direction toggle
  const handleToggleDirection = () => {
    // Toggle direction state
    const newDirection = direction === "to-branch" ? "to-headquarter" : "to-branch";
    setDirection(newDirection);
    
    // Call the branch selection hook's toggle function
    toggleDirection();
    
    // Reset form and products
    form.reset();
    setSearchTerm("");
  };

  // Submit handler
  const onSubmit = async (data: TransferStockFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Validate if any products are selected
      const selectedProds = filteredProducts.filter((p) => p.selected);
      if (selectedProds.length === 0) {
        toast("Pilih minimal satu produk untuk ditransfer");
        return;
      }
      
      // Validate stock
      const isStockValid = await validateStockForTransfer(
        selectedProds,
        data.cabang_id_from
      );
      
      if (!isStockValid) {
        return;
      }
      
      // Execute transfer
      const id = await executeStockTransfer(data, selectedProds);
      
      if (id) {
        setTransferId(id);
        setSuccessful(true);
        toast(`Transfer stok berhasil dengan ID: ${id}`);
        
        // Reset form
        form.reset();
        // Reset products selection
        handleSearch("");
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    branchesLoading,
    branches,
    centralBranch: branchSelection.centralBranch,
    sourceBranches,
    destinationBranches,
    fromCentralToBranch,
    toggleDirection,
    selectedProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    handleSearch: handleSearchChange,
    handleProductSelection,
    handleQuantityChange,
    productsLoading,
    searchTerm,
    successful,
    transferId,
    ITEMS_PER_PAGE
  };
};
