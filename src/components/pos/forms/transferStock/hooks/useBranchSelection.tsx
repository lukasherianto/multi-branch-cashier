import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export const useBranchSelection = (
  selectedCabangId: number | null,
  setCabang: (data: any) => void
) => {
  useEffect(() => {
    if (selectedCabangId) {
      const fetchCabang = async () => {
        const { data, error } = await supabase
          .from('cabang')
          .select('*')
          .eq('cabang_id', selectedCabangId)
          .single();

        if (error) {
          console.error("Error fetching cabang:", error);
          return;
        }

        setCabang(data);
      };

      fetchCabang();
    }
  }, [selectedCabangId, setCabang]);
};
