
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the current user's business ID (pelaku_usaha_id)
 */
export async function getUserBusinessId(): Promise<number> {
  try {
    // Get current user's pelaku_usaha_id
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error("Error getting user data");
    }
    
    const { data: pelakuUsaha, error: pelakulError } = await supabase
      .from("pelaku_usaha")
      .select("pelaku_usaha_id")
      .eq("user_id", userData.user.id)
      .single();
      
    if (pelakulError) {
      console.error("Error getting pelaku usaha:", pelakulError);
      throw new Error("Error getting business data");
    }

    return pelakuUsaha.pelaku_usaha_id;
  } catch (error) {
    console.error("Error getting user business ID:", error);
    throw error;
  }
}
