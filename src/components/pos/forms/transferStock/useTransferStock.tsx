
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useBranchSelection } from "./hooks/useBranchSelection";
import { useProductsWithPagination } from "./hooks/usePagination";
import { useProducts as useStockProducts } from "./hooks/useProducts";
import { toast } from "sonner";
import { executeStockTransfer } from "./utils/transferUtils";
import { schema } from "./schema";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";

export const useTransferStock = () => {
  const {
    branchesLoading,
    sourceBranches,
    destinationBranches,
    sourceBranch,
    destinationBranch,
    handleSourceBranchChange,
    handleDestinationBranchChange,
    centralBranch,
    branches,
    handleSelectSourceBranch,
    handleSelectDestinationBranch,
    toggleDirection
  } = useBranchSelection();

  const [fromCentralToBranch, setFromCentralToBranch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductWithSelection[]>([]);

  // Initialize form with default values
  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cabang_id_from: "",
      cabang_id_to: "",
      products: []
    }
  });

  const handleToggleDirection = () => {
    setFromCentralToBranch(!fromCentralToBranch);
    toggleDirection();
  };

  // Get the appropriate source branch ID
  const sourceBranchId = form.watch("cabang_id_from");

  // Get products for the selected source branch
  const { 
    products, 
    filteredProducts, 
    loading: productsLoading, 
    handleSearch,
    setFilteredProducts 
  } = useStockProducts(sourceBranchId);

  // Get paginated products
  const {
    ITEMS_PER_PAGE,
    paginatedProducts,
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage
  } = useProductsWithPagination(filteredProducts);

  // Handle product selection
  const handleProductSelection = (productId: number, selected: boolean) => {
    const updatedFilteredProducts = filteredProducts.map(product => 
      product.id === productId ? { ...product, selected } : product
    );
    setFilteredProducts(updatedFilteredProducts);
  };

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    const updatedFilteredProducts = filteredProducts.map(product => 
      product.id === productId ? { ...product, quantity } : product
    );
    setFilteredProducts(updatedFilteredProducts);
  };

  // Calculate total cost
  const totalCostPrice = filteredProducts
    .filter(product => product.selected)
    .reduce((total, product) => total + (product.cost_price * product.quantity), 0);

  // Update selectedProducts when filteredProducts change
  useEffect(() => {
    const selected = filteredProducts.filter(product => product.selected);
    setSelectedProducts(selected);
  }, [filteredProducts]);

  // Handle form submission
  const onSubmit = async (data: TransferStockFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Form data:", data);
      console.log("Selected products:", selectedProducts);

      if (selectedProducts.length === 0) {
        toast("Pilih minimal satu produk untuk ditransfer");
        return;
      }

      // Make sure the form values include selected products
      const transferData: TransferStockFormValues = {
        ...data,
        cabang_id_from: data.cabang_id_from,
        cabang_id_to: data.cabang_id_to,
        notes: data.notes
      };

      // Execute transfer operation
      const transferId = await executeStockTransfer(transferData, selectedProducts);
      
      if (transferId) {
        toast(`Transfer stok berhasil dengan ID: ${transferId}`);
        
        // Reset form and selection
        form.reset();
        setSelectedProducts([]);
        setFilteredProducts(products.map(p => ({ ...p, selected: false })));
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
    branchesLoading,
    productsLoading,
    isSubmitting,
    centralBranch,
    sourceBranches,
    destinationBranches,
    fromCentralToBranch,
    toggleDirection: handleToggleDirection,
    selectedProducts,
    paginatedProducts,
    totalCostPrice,
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
