
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBranches(pelakuUsaha: any) {
  const [centralBranchId, setCentralBranchId] = useState<string | null>(null);

  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ['branches', pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return [];
      const { data } = await supabase
        .from('cabang')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
        .order('cabang_id', { ascending: true });
      
      // Assuming the first branch is the central branch
      if (data && data.length > 0) {
        setCentralBranchId(data[0].cabang_id.toString());
      }
      
      return data || [];
    },
    enabled: !!pelakuUsaha,
  });

  // Get destinations branches (excluding central branch)
  const destinationBranches = branches.filter(branch => 
    branch.cabang_id.toString() !== centralBranchId
  );

  const centralBranch = branches.find(branch => 
    branch.cabang_id.toString() === centralBranchId
  );

  return {
    branches,
    branchesLoading,
    centralBranchId,
    centralBranch,
    destinationBranches
  };
}
