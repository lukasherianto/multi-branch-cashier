
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferStockSchema, type ProductTransfer, type TransferStockFormValues, ITEMS_PER_PAGE } from "./schema";
import { useBranches } from "./hooks/useBranches";
import { useProducts } from "./hooks/useProducts";
import { usePagination } from "./hooks/usePagination";
import { useTransferSubmit } from "./utils/transferUtils";
import { useToast } from "@/hooks/use-toast";

export function useTransferStock() {
  const { toast } = useToast();
  const [fromCentralToBranch, setFromCentralToBranch] = useState(true);
  const [sourceBranchId, setSourceBranchId] = useState<string | null>(null);
  
  // Default form values
  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      cabang_id_from: "",
      cabang_id_to: "",
      products: []
    }
  });

  // Fetch branch data
  const { 
    branches, 
    branchesLoading, 
    centralBranch 
  } = useBranches();

  // Set appropriate source and destination branches based on the transfer direction
  useEffect(() => {
    if (centralBranch) {
      // When direction changes, reset the form values
      if (fromCentralToBranch) {
        // Central to Branch: Source is Central, Destination are other branches
        form.setValue("cabang_id_from", centralBranch.cabang_id.toString());
        form.setValue("cabang_id_to", "");
        setSourceBranchId(centralBranch.cabang_id.toString());
      } else {
        // Branch to Central: Source is empty (to be chosen), Destination is Central
        form.setValue("cabang_id_from", "");
        form.setValue("cabang_id_to", centralBranch.cabang_id.toString());
        setSourceBranchId(null);
      }
    }
  }, [centralBranch, fromCentralToBranch, form]);

  // Create filtered branch lists for source and destination
  const sourceBranches = fromCentralToBranch 
    ? [centralBranch].filter(Boolean) 
    : branches.filter(branch => branch.cabang_id !== centralBranch?.cabang_id);
  
  const destinationBranches = fromCentralToBranch 
    ? branches.filter(branch => branch.cabang_id !== centralBranch?.cabang_id) 
    : [centralBranch].filter(Boolean);

  // Handle direction toggle
  const toggleDirection = () => {
    setFromCentralToBranch(!fromCentralToBranch);
    form.reset({
      cabang_id_from: "",
      cabang_id_to: "",
      products: []
    });
  };

  // Product related functionality
  const {
    selectedProducts,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    setSelectedProducts,
  } = useProducts(sourceBranchId);

  // Pagination - Fix: usePagination expects only one argument
  const {
    currentPage,
    totalPages,
    paginatedProducts,
    handleNextPage,
    handlePreviousPage,
  } = usePagination(selectedProducts);

  // Submit functionality
  const { isSubmitting, submitTransfer } = useTransferSubmit();

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
        values.cabang_id_from, // Use the selected source branch
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
