
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { useForm } from "react-hook-form";
import { TransferStockFormValues } from "@/types/pos";
import { useToast } from "@/hooks/use-toast";

export const useBranchManagement = (form: ReturnType<typeof useForm<TransferStockFormValues>>) => {
  const { cabangList } = useAuth();
  const [fromCentralToBranch, setFromCentralToBranch] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [centralBranch, setCentralBranch] = useState<any>(null);
  const [sourceBranches, setSourceBranches] = useState<any[]>([]);
  const [destinationBranches, setDestinationBranches] = useState<any[]>([]);
  const { toast } = useToast();

  // Setup branches when cabangList is loaded
  useEffect(() => {
    if (!cabangList || cabangList.length === 0) {
      console.log("No cabangList available, skipping setup");
      return;
    }
    
    console.log("Setting up branches with cabangList:", cabangList);
    setBranchesLoading(true);
    
    try {
      // Identify the central branch (first/lowest ID or status=1)
      const sortedBranches = [...cabangList].sort((a, b) => a.cabang_id - b.cabang_id);
      const central = sortedBranches.find(b => b.status === 1) || sortedBranches[0];
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
        // From branch to central: sources are all branches except central, destination is central
        setSourceBranches(sortedBranches.filter(b => b.cabang_id !== central.cabang_id));
        setDestinationBranches([central]);
        
        // Reset the form source value since there are multiple source options now
        form.setValue('cabang_id_from', '');
      }
    } catch (error) {
      console.error("Error setting up branches:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyiapkan data cabang",
      });
    } finally {
      setBranchesLoading(false);
    }
  }, [cabangList, fromCentralToBranch, form, toast]);

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
