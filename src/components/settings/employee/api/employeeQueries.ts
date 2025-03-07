import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch employee data from profiles table
 */
export async function fetchEmployeeProfiles(pelakuUsahaId: number, cabangId?: number) {
  // Get all employees from profiles table where is_employee is true
  // and belongs to the current pelaku_usaha_id or has the same cabang_id
  let profileQuery = supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      whatsapp_number,
      is_employee,
      pelaku_usaha_id,
      cabang_id,
      email,
      role,
      business_role,
      cabang (
        branch_name
      )
    `)
    .eq("is_employee", true);
  
  // Add filter for cabang_id if provided
  if (cabangId) {
    profileQuery = profileQuery.eq("cabang_id", cabangId);
  } else {
    // Otherwise filter by pelaku_usaha_id
    profileQuery = profileQuery.eq("pelaku_usaha_id", pelakuUsahaId);
  }

  const { data: profileData, error: profileError } = await profileQuery;

  if (profileError) {
    console.error("Error fetching employee profiles:", profileError);
    throw profileError;
  }

  return profileData;
}
