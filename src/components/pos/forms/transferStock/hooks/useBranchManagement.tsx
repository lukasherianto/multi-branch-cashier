
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { TransferStockFormValues } from "@/types/pos";

export const useBranchManagement = (form: ReturnType<typeof useForm<TransferStockFormValues>>) => {
  const { cabangList } = useAuth();
  const [fromCentralToBranch, setFromCentralToBranch] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [centralBranch, setCentralBranch] = useState<any>(null);
  const [sourceBranches, setSourceBranches] = useState<any[]>([]);
  const [destinationBranches, setDestinationBranches] = useState<any[]>([]);

  // Setup branches when cabangList is loaded
  useEffect(() => {
    if (!cabangList || cabangList.length === 0) return;
    
    console.log("Setting up branches with cabangList:", cabangList);
    setBranchesLoading(true);
    
    try {
      // Identify the central branch (first/lowest ID)
      const sortedBranches = [...cabangList].sort((a, b) => a.cabang_id - b.cabang_id);
      const central = sortedBranches[0];
      setCentralBranch(central);
      
      console.log("Central branch identified:", central);
      
      if (fromCentralToBranch) {
        // From central to branch: source is central, destinations are all others
        setSourceBranches([central]);
        setDestinationBranches(sortedBranches.filter(b => b.cabang_id !== central.cabang_id));
        
        // Auto-select central as source
        form.setValue('cabang_id_from', central.cabang_id.toString());
        console.log("Auto-selected central branch as source:", central.cabang_id.toString());
      } else {
        // From branch to central: sources are all branches, destination is central
        setSourceBranches(sortedBranches);
        setDestinationBranches([central]);
        
        // Reset the form source value since there are multiple source options now
        form.setValue('cabang_id_from', '');
      }
    } catch (error) {
      console.error("Error setting up branches:", error);
    } finally {
      setBranchesLoading(false);
    }
  }, [cabangList, fromCentralToBranch, form]);

  // Toggle direction changes how branches are filtered
  const toggleDirection = () => {
    setFromCentralToBranch(prev => !prev);
    // Reset the form values when direction changes
    form.setValue('cabang_id_from', '');
    form.setValue('cabang_id_to', '');
  };

  return {
    branchesLoading,
    cabangList,
    centralBranch,
    sourceBranches,
    destinationBranches,
    fromCentralToBranch,
    toggleDirection
  };
};
