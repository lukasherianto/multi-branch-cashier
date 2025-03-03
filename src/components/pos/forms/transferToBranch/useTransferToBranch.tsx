
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./schema";
import { TransferToBranchValues } from "@/types/pos";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transferToBranch } from "./transferToBranchUtils";
import { useCentralProducts } from "./useCentralProducts";
import { usePagination } from "./usePagination";

export const useTransferToBranch = () => {
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [centralBranch, setCentralBranch] = useState<any>(null);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalCostPrice, setTotalCostPrice] = useState(0);

  // Initialize the form
  const form = useForm<TransferToBranchValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cabang_id_to: "",
      notes: ""
    }
  });

  // Fetch branch options
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchesLoading(true);
        const { data: branchData, error } = await supabase
          .from("cabang")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (branchData && branchData.length > 0) {
          // Find central branch (assuming status 1 is for central branch)
          const central = branchData.find(branch => branch.status === 1);
          if (central) {
            setCentralBranch(central);
          }
          
          // Filter out central branch from options
          const branches = branchData.filter(branch => branch.status !== 1);
          setBranchOptions(branches);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error("Error loading branches");
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Get central products
  const {
    filteredProducts,
    loading: productsLoading, 
    handleSearch,
    handleProductSelection,
    handleQuantityChange
  } = useCentralProducts(centralBranch?.cabang_id);

  // Set up pagination
  const {
    currentPage,
    totalPages,
    paginatedProducts,
    handleNextPage,
    handlePreviousPage,
    ITEMS_PER_PAGE
  } = usePagination(filteredProducts);

  // Calculate totals when products change
  useEffect(() => {
    if (filteredProducts) {
      const selectedProducts = filteredProducts.filter(p => p.selected);
      const itemCount = selectedProducts.length;
      const costTotal = selectedProducts.reduce((sum, p) => sum + ((p.cost_price || 0) * p.quantity), 0);
      
      setTotalItems(itemCount);
      setTotalCostPrice(costTotal);
    }
  }, [filteredProducts]);

  // Handle form submission
  const onSubmit = async (data: TransferToBranchValues) => {
    try {
      setIsSubmitting(true);
      const selectedProducts = filteredProducts.filter(p => p.selected);
      
      if (selectedProducts.length === 0) {
        toast.error("Pilih minimal satu produk untuk ditransfer");
        return;
      }

      if (!centralBranch) {
        toast.error("Cabang pusat tidak ditemukan");
        return;
      }

      // Execute transfer
      await transferToBranch(
        centralBranch.cabang_id,
        parseInt(data.cabang_id_to),
        selectedProducts,
        data.notes
      );

      // Reset form
      form.reset();
      
      toast.success("Transfer stok berhasil");
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected products
  const selectedProducts = filteredProducts.filter(p => p.selected);

  return {
    form,
    branchOptions,
    branchesLoading,
    productsLoading,
    onSubmit,
    centralBranch,
    filteredProducts,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    totalCostPrice,
    totalItems,
    isSubmitting,
    selectedProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    ITEMS_PER_PAGE
  };
};
