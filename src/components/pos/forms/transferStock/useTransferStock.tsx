
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useProducts } from "./hooks/useProducts";
import { usePagination } from "./hooks/usePagination";
import { useBranchSelection } from "./hooks/useBranchSelection";
import { transferStockSchema } from "./schema";
import { executeStockTransfer, validateStockForTransfer } from "./utils/transferUtils";

export type TransferStockFormValues = z.infer<typeof transferStockSchema>;

export const useTransferStock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const [transferId, setTransferId] = useState<number | null>(null);
  const [direction, setDirection] = useState<"to-branch" | "to-headquarter">("to-branch");

  const {
    sourceBranch,
    destinationBranch,
    branches,
    handleSelectSourceBranch,
    handleSelectDestinationBranch,
    toggleDirection,
  } = useBranchSelection(direction);

  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      cabang_id_from: "",
      cabang_id_to: "",
    },
  });

  // Update form values when branches change
  React.useEffect(() => {
    if (sourceBranch) {
      form.setValue("cabang_id_from", sourceBranch.cabang_id.toString());
    }
    if (destinationBranch) {
      form.setValue("cabang_id_to", destinationBranch.cabang_id.toString());
    }
  }, [sourceBranch, destinationBranch, form]);

  // Get products based on the selected source branch
  const { products, filteredProducts, loading, handleSearch } = useProducts(
    sourceBranch?.cabang_id?.toString()
  );

  // Setup pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProducts,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(
    searchTerm
      ? filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : filteredProducts
  );

  // Handle product selection
  const handleProductSelection = (productId: number, selected: boolean) => {
    const updatedProducts = filteredProducts.map((product) =>
      product.id === productId ? { ...product, selected } : product
    );
    
    // Get the products hook's setFilteredProducts function
    useProducts.setFilteredProducts(updatedProducts);
  };

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    const updatedProducts = filteredProducts.map((product) =>
      product.id === productId ? { ...product, quantity } : product
    );
    
    // Get the products hook's setFilteredProducts function
    useProducts.setFilteredProducts(updatedProducts);
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
      setIsTransferring(true);
      
      // Validate if any products are selected
      const selectedProducts = filteredProducts.filter((p) => p.selected);
      if (selectedProducts.length === 0) {
        toast("Pilih minimal satu produk untuk ditransfer");
        return;
      }
      
      // Validate stock
      const isStockValid = await validateStockForTransfer(
        selectedProducts,
        data.cabang_id_from
      );
      
      if (!isStockValid) {
        return;
      }
      
      // Execute transfer
      const id = await executeStockTransfer(data, selectedProducts);
      
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
      setIsTransferring(false);
    }
  };

  return {
    form,
    onSubmit,
    products,
    filteredProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    loading,
    handleProductSelection,
    handleQuantityChange,
    handleSearchChange,
    searchTerm,
    isTransferring,
    successful,
    transferId,
    sourceBranch,
    destinationBranch,
    branches,
    handleSelectSourceBranch,
    handleSelectDestinationBranch,
    direction,
    handleToggleDirection,
  };
};
