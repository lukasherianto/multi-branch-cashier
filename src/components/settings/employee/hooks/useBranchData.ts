
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Branch } from "../types";
import { fetchBranches } from "../api/branchApi";

export const useBranchData = () => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadBranches = async (pelakuUsahaId: number) => {
    try {
      console.log("Loading branches...");
      const branchesData = await fetchBranches(pelakuUsahaId);
      
      console.log("Branches loaded:", branchesData);
      setBranches(branchesData);
      return branchesData;
    } catch (err: any) {
      console.error("Error loading branches:", err);
      setError(err.message || "Gagal memuat data cabang");
      toast({
        title: "Error",
        description: "Gagal memuat data cabang",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    branches,
    setBranches,
    loadBranches,
    error
  };
};
