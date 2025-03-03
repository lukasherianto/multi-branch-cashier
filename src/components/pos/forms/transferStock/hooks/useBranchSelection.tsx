
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { TransferStockFormValues } from "../schema";
import { useBranches } from "./useBranches";

export function useBranchSelection(form: UseFormReturn<TransferStockFormValues>) {
  const [fromCentralToBranch, setFromCentralToBranch] = useState(true);
  const [sourceBranchId, setSourceBranchId] = useState<string | null>(null);
  
  // Fetch branch data
  const { 
    branches, 
    branchesLoading, 
    centralBranch 
  } = useBranches();

  // Set appropriate source and destination branches based on the transfer direction
  useEffect(() => {
    if (!centralBranch) return;
    
    // When direction changes, reset the form values
    if (fromCentralToBranch) {
      // Central to Branch: Source is Central, Destination are other branches
      form.setValue("cabang_id_from", centralBranch.cabang_id.toString());
      form.setValue("cabang_id_to", "");
      setSourceBranchId(centralBranch.cabang_id.toString());
      console.log("Direction changed to central→branch, source ID:", centralBranch.cabang_id.toString());
    } else {
      // Branch to Central: Source is empty (to be chosen), Destination is Central
      form.setValue("cabang_id_from", "");
      form.setValue("cabang_id_to", centralBranch.cabang_id.toString());
      setSourceBranchId(null);
      console.log("Direction changed to branch→central, source ID reset to null");
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

  // Auto-select source branch if there's only one option (for branch to central)
  useEffect(() => {
    if (!fromCentralToBranch && sourceBranches.length === 1) {
      const autoSelectedBranchId = sourceBranches[0].cabang_id.toString();
      form.setValue("cabang_id_from", autoSelectedBranchId);
      setSourceBranchId(autoSelectedBranchId);
      console.log("Auto-selected source branch:", autoSelectedBranchId);
    }
  }, [fromCentralToBranch, sourceBranches, form]);

  // Update sourceBranchId when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'cabang_id_from' && value.cabang_id_from) {
        setSourceBranchId(value.cabang_id_from);
        console.log("Source branch ID updated to:", value.cabang_id_from);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  return {
    fromCentralToBranch,
    toggleDirection,
    sourceBranchId,
    setSourceBranchId,
    sourceBranches,
    destinationBranches,
    branches,
    branchesLoading,
    centralBranch
  };
}
