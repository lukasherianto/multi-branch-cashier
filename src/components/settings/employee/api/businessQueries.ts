
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch pelaku usaha data for a given user
 */
export async function fetchUserPelakuUsaha(userId: string) {
  if (!userId) {
    console.error("Invalid userId:", userId);
    throw new Error("ID pengguna tidak valid");
  }
  
  const { data, error } = await supabase
    .from("pelaku_usaha")
    .select("pelaku_usaha_id, business_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching pelaku usaha:", error);
    throw error;
  }

  return data;
}
