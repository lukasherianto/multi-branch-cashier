
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBranches() {
  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ['branches-for-transfer'],
    queryFn: async () => {
      console.log("Fetching branches for transfer");
      try {
        const userResponse = await supabase.auth.getUser();
        
        if (!userResponse.data.user) {
          console.error("No authenticated user found in useBranches");
          return [];
        }
        
        const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
          .from('pelaku_usaha')
          .select('pelaku_usaha_id')
          .eq('user_id', userResponse.data.user.id)
          .maybeSingle();

        if (pelakuUsahaError) {
          console.error("Error fetching pelaku usaha:", pelakuUsahaError);
          return [];
        }

        if (!pelakuUsaha) {
          console.log("No pelaku usaha found");
          return [];
        }
        
        const { data, error } = await supabase
          .from('cabang')
          .select('cabang_id, branch_name, address')
          .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
          .order('cabang_id', { ascending: true });
          
        if (error) {
          console.error("Error fetching branches:", error);
          return [];
        }

        console.log("Branches fetched:", data);
        return data || [];
      } catch (error) {
        console.error("Error in branches query:", error);
        return [];
      }
    },
    retry: 2,
    staleTime: 60000,
  });

  // Find central branch (usually the first branch - cabang pusat)
  const centralBranch = branches.length > 0 ? branches[0] : null;

  return {
    branches,
    branchesLoading,
    centralBranch
  };
}
