
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBranches(pelakuUsaha: any) {
  const [centralBranchId, setCentralBranchId] = useState<string | null>(null);

  const { 
    data: branches = [], 
    isLoading: branchesLoading,
    error: branchesError 
  } = useQuery({
    queryKey: ['branches', pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      console.log("Fetching branches for pelakuUsaha:", pelakuUsaha);
      if (!pelakuUsaha) {
        console.log("No pelakuUsaha provided, returning empty branches array");
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('cabang')
          .select('*')
          .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
          .order('cabang_id', { ascending: true });
        
        if (error) {
          console.error("Error fetching branches:", error);
          throw error;
        }
        
        console.log("Branches fetched:", data);
        
        // Assuming the first branch is the central branch
        if (data && data.length > 0) {
          setCentralBranchId(data[0].cabang_id.toString());
          console.log("Setting central branch ID:", data[0].cabang_id);
        } else {
          console.log("No branches found");
        }
        
        return data || [];
      } catch (error) {
        console.error("Error in branches query:", error);
        return [];
      }
    },
    enabled: !!pelakuUsaha,
    retry: 2,
    staleTime: 60000,
  });

  useEffect(() => {
    if (branchesError) {
      console.error("Branches query error:", branchesError);
    }
  }, [branchesError]);

  // Get destinations branches (excluding central branch)
  const destinationBranches = branches.filter(branch => 
    branch.cabang_id.toString() !== centralBranchId
  );

  const centralBranch = branches.find(branch => 
    branch.cabang_id.toString() === centralBranchId
  );

  console.log("Branches hook results:", {
    branches: branches.length,
    centralBranchId,
    centralBranch,
    destinationBranches: destinationBranches.length
  });

  return {
    branches,
    branchesLoading,
    branchesError,
    centralBranchId,
    centralBranch,
    destinationBranches
  };
}
