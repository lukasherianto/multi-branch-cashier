
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Branch {
  cabang_id: number;
  branch_name: string;
  // Add other necessary branch properties
}

export interface UseBranchSelectionReturn {
  branchesLoading: boolean;
  branches: Branch[];
  sourceBranches: Branch[];
  destinationBranches: Branch[];
  fromCentralToBranch: boolean;
  centralBranch: Branch | null;
  sourceBranch: Branch | null;
  destinationBranch: Branch | null;
  handleSourceBranchChange: (branchId: string) => void;
  handleDestinationBranchChange: (branchId: string) => void;
  handleSelectSourceBranch: (branch: Branch) => void;
  handleSelectDestinationBranch: (branch: Branch) => void;
  toggleDirection: () => void;
}

export const useBranchSelection = (initialDirection: "to-branch" | "to-headquarter" = "to-branch"): UseBranchSelectionReturn => {
  const { cabangList } = useAuth();
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [fromCentralToBranch, setFromCentralToBranch] = useState(initialDirection === "to-branch");
  const [sourceBranch, setSourceBranch] = useState<Branch | null>(null);
  const [destinationBranch, setDestinationBranch] = useState<Branch | null>(null);
  
  // Convert cabangList to proper Branch type
  const branches: Branch[] = cabangList.map(cabang => ({
    cabang_id: cabang.cabang_id,
    branch_name: cabang.branch_name,
    // Map other properties as needed
  }));

  // Sort branches by ID (lowest first - we consider this the headquarters)
  const sortedBranches = [...branches].sort((a, b) => a.cabang_id - b.cabang_id);
  
  // Headquarters is the branch with the lowest ID
  const centralBranch = sortedBranches.length > 0 ? sortedBranches[0] : null;
  
  // Define source and destination branches based on direction
  const sourceBranches = fromCentralToBranch 
    ? [centralBranch].filter(Boolean) as Branch[]
    : branches.filter(b => b.cabang_id !== centralBranch?.cabang_id);
    
  const destinationBranches = fromCentralToBranch
    ? branches.filter(b => b.cabang_id !== centralBranch?.cabang_id)
    : [centralBranch].filter(Boolean) as Branch[];

  useEffect(() => {
    if (branches.length > 0) {
      setBranchesLoading(false);
      
      // Set default selections
      if (!sourceBranch && sourceBranches.length > 0) {
        setSourceBranch(sourceBranches[0]);
      }
      
      if (!destinationBranch && destinationBranches.length > 0) {
        setDestinationBranch(destinationBranches[0]);
      }
    }
  }, [branches, fromCentralToBranch]);

  const handleSourceBranchChange = (branchId: string) => {
    const selected = branches.find(b => b.cabang_id.toString() === branchId);
    if (selected) {
      setSourceBranch(selected);
    }
  };

  const handleDestinationBranchChange = (branchId: string) => {
    const selected = branches.find(b => b.cabang_id.toString() === branchId);
    if (selected) {
      setDestinationBranch(selected);
    }
  };

  const handleSelectSourceBranch = (branch: Branch) => {
    setSourceBranch(branch);
  };

  const handleSelectDestinationBranch = (branch: Branch) => {
    setDestinationBranch(branch);
  };

  const toggleDirection = () => {
    setFromCentralToBranch(!fromCentralToBranch);
    setSourceBranch(null);
    setDestinationBranch(null);
  };

  return {
    branchesLoading,
    branches,
    sourceBranches,
    destinationBranches,
    fromCentralToBranch,
    centralBranch,
    sourceBranch,
    destinationBranch,
    handleSourceBranchChange,
    handleDestinationBranchChange,
    handleSelectSourceBranch,
    handleSelectDestinationBranch,
    toggleDirection
  };
};
