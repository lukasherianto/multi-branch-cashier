
import { supabase } from "@/integrations/supabase/client";
import { Branch } from "../types";

export async function fetchBranches(pelakuUsahaId: number) {
  const { data, error } = await supabase
    .from("cabang")
    .select("*")
    .eq("pelaku_usaha_id", pelakuUsahaId)
    .order('branch_name', { ascending: true });

  if (error) {
    console.error("Error loading branches:", error);
    throw error;
  }
  
  console.log("Branches loaded:", data);
  return data as Branch[];
}
