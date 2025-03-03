
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useCentralProducts } from "./useCentralProducts"; 
import { usePagination } from "./usePagination";
import { toast } from "sonner";
import { schema } from "./schema";
import { executeTransferToBranch } from "./transferToBranchUtils";
import { ProductWithSelection, TransferToBranchValues } from "@/types/pos";

export const useTransferToBranch = () => {
  const { cabangList } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [centralBranchId, setCentralBranchId] = useState<number | null>(null);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductWithSelection[]>([]);
  const [totalCostPrice, setTotalCostPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Find the central branch (assuming it's the first branch)
  useEffect(() => {
    setBranchesLoading(true);
    if (cabangList && cabangList.length > 0) {
      // Sort branches by ID, assume lowest ID is headquarters
      const sortedBranches = [...cabangList].sort((a, b) => a.cabang_id - b.cabang_id);
      setCentralBranchId(sortedBranches[0].cabang_id);
    }
    setBranchesLoading(false);
  }, [cabangList]);

  // Get destination branches (all except central)
  const destinationBranches = centralBranchId 
    ? cabangList.filter(branch => branch.cabang_id !== centralBranchId)
    : [];

  // Create branch options for dropdown
  const branchOptions = destinationBranches.map(branch => ({
    value: branch.cabang_id.toString(),
    label: branch.branch_name
  }));

  // Initialize form with default values
  const form = useForm<TransferToBranchValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cabang_id_to: "",
      products: [],
      notes: ""
    }
  });

  // Get central branch products
  const {
    filteredProducts,
    loading,
    handleSearch,
    handleProductSelection,
    handleQuantityChange
  } = useCentralProducts(centralBranchId);

  // Setup pagination
  const {
    currentPage,
    totalPages,
    paginatedProducts,
    handleNextPage,
    handlePreviousPage,
    ITEMS_PER_PAGE
  } = usePagination(filteredProducts);

  // Update selected products and total cost price when filtered products change
  useEffect(() => {
    const selected = filteredProducts.filter(product => product.selected);
    setSelectedProducts(selected);
    
    // Calculate total cost price
    const total = selected.reduce(
      (sum, product) => sum + (product.cost_price * product.quantity),
      0
    );
    setTotalCostPrice(total);
    setTotalItems(selected.length);
    setProductsLoading(loading);
  }, [filteredProducts, loading]);

  // Handle form submission
  const onSubmit = async (data: TransferToBranchValues) => {
    try {
      if (!centralBranchId) {
        toast("Cabang pusat belum ditemukan");
        return;
      }

      if (selectedProducts.length === 0) {
        toast("Pilih minimal satu produk untuk ditransfer");
        return;
      }

      setIsSubmitting(true);
      
      // Execute transfer
      const transferId = await executeTransferToBranch(
        data, 
        selectedProducts,
        centralBranchId
      );
      
      if (transferId) {
        toast(`Transfer stok berhasil dengan ID: ${transferId}`);
        
        // Reset form and selection
        form.reset();
        // Reset product selection would happen here
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
    branchOptions,
    branchesLoading,
    productsLoading,
    isSubmitting,
    centralBranch: cabangList.find(branch => branch.cabang_id === centralBranchId),
    destinationBranches,
    selectedProducts,
    paginatedProducts,
    totalCostPrice,
    currentPage,
    totalPages,
    totalItems,
    handleNextPage,
    handlePreviousPage,
    ITEMS_PER_PAGE,
    handleSearch,
    handleProductSelection,
    handleQuantityChange
  };
};
