
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./schema";
import { TransferToBranchValues } from "@/types/pos";
import { useCentralProducts } from "./useCentralProducts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transferProductToBranch } from "./transferToBranchUtils";

export const useTransferToBranch = () => {
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [centralBranch, setCentralBranch] = useState<any>(null);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalCostPrice, setTotalCostPrice] = useState(0);

  // Get central products
  const {
    filteredProducts,
    loading: productsLoading, 
    handleSearch,
    handleProductSelection,
    handleQuantityChange
  } = useCentralProducts();

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
          // Find central branch
          const central = branchData.find(branch => branch.is_pusat === true);
          if (central) {
            setCentralBranch(central);
          }
          
          // Filter out central branch from options
          const branches = branchData.filter(branch => !branch.is_pusat);
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
      await transferProductToBranch(
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
    }
  };

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
    totalItems
  };
};
