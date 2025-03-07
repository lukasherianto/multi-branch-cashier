
import { supabase } from "@/integrations/supabase/client";
import { Branch } from "../types";

export async function fetchBranches(pelakuUsahaId: number): Promise<Branch[]> {
  console.log("Fetching branches for:", pelakuUsahaId);
  const { data, error } = await supabase
    .from("cabang")
    .select("cabang_id, branch_name")
    .eq("pelaku_usaha_id", pelakuUsahaId)
    .order('branch_name', { ascending: true });

  if (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }

  return data as Branch[];
}
