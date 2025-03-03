
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { TransferStockFormValues } from "../schema";
import { useBranches, type Branch } from "./useBranches";
import { useProducts } from "@/hooks/products";

export const useBranchSelection = (
  form: UseFormReturn<TransferStockFormValues>,
  fromCentralToBranch: boolean
) => {
  const { branches, centralBranch, branchesLoading } = useBranches();
  const { fetchProducts } = useProducts();
  
  // Set available source branches based on direction
  const sourceBranches = fromCentralToBranch 
    ? (centralBranch ? [centralBranch] : [])
    : branches.filter(b => b.cabang_id !== centralBranch?.cabang_id);
    
  // Set available destination branches based on direction
  const destinationBranches = fromCentralToBranch
    ? branches.filter(b => b.cabang_id !== centralBranch?.cabang_id) 
    : (centralBranch ? [centralBranch] : []);
  
  // Auto-select source branch on direction change
  useEffect(() => {
    if (fromCentralToBranch && centralBranch) {
      form.setValue('cabang_id_from', centralBranch.cabang_id.toString());
    } else {
      form.setValue('cabang_id_from', '');
    }
    
    // Reset destination selection
    form.setValue('cabang_id_to', '');
  }, [fromCentralToBranch, centralBranch, form]);
  
  // Handle source branch selection
  const handleSourceBranchChange = (branchId: string) => {
    form.setValue('cabang_id_from', branchId);
    
    // Fetch products for the selected branch
    if (branchId) {
      fetchProducts(parseInt(branchId));
    }
  };
  
  // Handle destination branch selection
  const handleDestinationBranchChange = (branchId: string) => {
    form.setValue('cabang_id_to', branchId);
  };
  
  return {
    branchesLoading,
    sourceBranches,
    destinationBranches,
    handleSourceBranchChange,
    handleDestinationBranchChange
  };
};
