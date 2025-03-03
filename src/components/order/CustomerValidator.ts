
import { supabase } from "@/integrations/supabase/client";

export const validateMemberId = async (id: number | null): Promise<boolean> => {
  if (id === null) return true; // Null memberId is valid (non-member transaction)
  
  try {
    console.log(`Validating pelanggan ID: ${id}`);
    const { data, error } = await supabase
      .from('pelanggan')
      .select('pelanggan_id')
      .eq('pelanggan_id', id)
      .maybeSingle();
      
    if (error) {
      console.error("Pelanggan validation query error:", error);
      return false;
    }
    
    if (!data) {
      console.error("Pelanggan not found with ID:", id);
      return false;
    }
    
    console.log("Pelanggan validation successful:", data);
    return true;
  } catch (err) {
    console.error("Unexpected error during pelanggan validation:", err);
    return false;
  }
};
