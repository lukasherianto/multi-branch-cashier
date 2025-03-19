
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Branch } from "../types";
import { supabase } from "@/integrations/supabase/client";

export const useBranchData = () => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadBranches = async (pelakuUsahaId: number) => {
    if (!pelakuUsahaId) {
      console.error("Invalid pelaku_usaha_id provided to loadBranches");
      return [];
    }
    
    setIsLoading(true);
    
    try {
      console.log("Loading branches for pelaku_usaha_id:", pelakuUsahaId);
      
      const { data, error } = await supabase
        .from('cabang')
        .select('cabang_id, branch_name, status')
        .eq('pelaku_usaha_id', pelakuUsahaId);
      
      if (error) {
        throw error;
      }
      
      console.log("Branches loaded:", data);
      
      const formattedBranches: Branch[] = data.map(branch => ({
        cabang_id: branch.cabang_id,
        branch_name: branch.branch_name,
        status: branch.status
      }));
      
      setBranches(formattedBranches);
      return formattedBranches;
    } catch (err: any) {
      console.error("Error loading branches:", err);
      toast({
        title: "Error",
        description: "Gagal memuat data cabang",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    branches,
    loadBranches,
    isLoading
  };
};
