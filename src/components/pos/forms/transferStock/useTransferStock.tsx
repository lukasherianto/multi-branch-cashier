
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { transferStockSchema, type TransferStockFormValues, ITEMS_PER_PAGE } from "./schema";
import { useProducts } from "./hooks/useProducts";
import { usePagination } from "./hooks/usePagination";
import { useBranches } from "./hooks/useBranches";
import { useTransferSubmit } from "./utils/transferUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTransferStock() {
  const { user } = useAuth();
  
  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      products: []
    }
  });

  const { data: pelakuUsaha } = useQuery({
    queryKey: ['pelakuUsaha', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { 
    branches, 
    branchesLoading, 
    centralBranchId, 
    centralBranch, 
    destinationBranches 
  } = useBranches(pelakuUsaha);

  const { 
    selectedProducts, 
    filteredProducts, 
    handleSearch, 
    handleProductSelection, 
    handleQuantityChange 
  } = useProducts(pelakuUsaha, centralBranchId);

  const { 
    currentPage, 
    totalPages, 
    paginatedProducts, 
    handlePreviousPage, 
    handleNextPage 
  } = usePagination(filteredProducts);

  const { isSubmitting, submitTransfer } = useTransferSubmit();

  const resetForm = () => {
    form.reset();
    // Reset product selections
    handleSearch("");
    selectedProducts.forEach(p => {
      handleProductSelection(p.produk_id, false);
      handleQuantityChange(p.produk_id, 0);
    });
  };

  async function onSubmit(values: TransferStockFormValues) {
    await submitTransfer(values, selectedProducts, centralBranchId, resetForm);
  }

  return {
    form,
    isSubmitting,
    branchesLoading,
    branches,
    centralBranch,
    destinationBranches,
    selectedProducts,
    filteredProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    searchTerm: "",
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    handlePreviousPage,
    handleNextPage,
    onSubmit,
    ITEMS_PER_PAGE
  };
}
