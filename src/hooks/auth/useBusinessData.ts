
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessData = () => {
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);

  // Function to fetch user's business data
  const fetchBusinessData = async (userId: string) => {
    try {
      console.log("Fetching business data for user ID:", userId);
      
      // Get pelaku_usaha data
      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error("Error fetching pelaku usaha:", pelakuUsahaError);
      } else if (pelakuUsahaData) {
        console.log("Found pelaku usaha:", pelakuUsahaData);
        setPelakuUsaha(pelakuUsahaData);
        
        // Get branches data
        const { data: cabangData, error: cabangError } = await supabase
          .from('cabang')
          .select('*')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
          .order('cabang_id', { ascending: true });

        if (cabangError) {
          console.error("Error fetching cabang:", cabangError);
        } else if (cabangData && cabangData.length > 0) {
          console.log("Found cabang:", cabangData);
          setCabangList(cabangData);
          
          // Find the main branch (HQ) or use the first branch
          const mainCabang = cabangData.find(c => c.status === 1) || cabangData[0];
          setCabang(mainCabang);
          setSelectedCabangId(mainCabang.cabang_id);
        }
      }
    } catch (error) {
      console.error("Error in fetchBusinessData:", error);
    }
  };

  return {
    pelakuUsaha,
    setPelakuUsaha,
    cabang,
    setCabang,
    cabangList,
    setCabangList,
    selectedCabangId,
    setSelectedCabangId,
    fetchBusinessData
  };
};
