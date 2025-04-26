
import { useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessData = (
  user: User | null,
  selectedCabangId: number | null,
  setPelakuUsaha: (data: any) => void,
  setCabangList: (data: any[]) => void,
  setCabang: (data: any) => void,
  setSelectedCabangId: (id: number | null) => void
) => {
  useEffect(() => {
    if (user) {
      const fetchPelakuUsaha = async () => {
        try {
          console.log("Fetching pelaku usaha for user:", user.id);
          
          const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
            .from('pelaku_usaha')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (pelakuUsahaError) {
            console.error('Error mengambil data pelaku usaha:', pelakuUsahaError);
            return;
          }

          if (!pelakuUsahaData) {
            console.log("No pelaku_usaha found for user:", user.id);
            setPelakuUsaha(null);
            setCabangList([]);
            setCabang(null);
            setSelectedCabangId(null);
            return;
          }

          console.log("Data pelaku usaha ditemukan:", pelakuUsahaData);
          setPelakuUsaha(pelakuUsahaData);

          // Get all branches for this pelaku usaha
          const { data: cabangData, error: cabangError } = await supabase
            .from('cabang')
            .select('*')
            .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

          if (cabangError) {
            console.error('Error mengambil data cabang:', cabangError);
            return;
          }

          console.log("Data cabang:", cabangData);

          // Sort branches by ID to ensure the first branch (headquarters) is first
          const sortedBranches = (cabangData || []).sort((a, b) => a.cabang_id - b.cabang_id);
          setCabangList(sortedBranches);
          
          // If there's only one branch, select it automatically
          if (sortedBranches.length === 1) {
            setSelectedCabangId(sortedBranches[0].cabang_id);
            setCabang(sortedBranches[0]);
          }
          // If there are multiple branches and none selected, default to Pusat (first/lowest ID branch)
          else if (sortedBranches.length > 1 && !selectedCabangId) {
            const headquartersId = sortedBranches[0].cabang_id;
            setSelectedCabangId(headquartersId);
            setCabang(sortedBranches[0]);
          }
        } catch (error) {
          console.error('Error in fetchPelakuUsaha:', error);
        }
      };

      fetchPelakuUsaha();
    }
  }, [user, selectedCabangId, setPelakuUsaha, setCabangList, setCabang, setSelectedCabangId]);
};
