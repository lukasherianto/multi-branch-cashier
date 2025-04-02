import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";
import { mapEmployeeData } from "./employeeMappers";

/**
 * Fetches employees for a specific business
 */
export async function fetchEmployees(pelakuUsahaId: number, cabangId?: number) {
  if (!pelakuUsahaId) {
    console.error("Invalid pelakuUsahaId:", pelakuUsahaId);
    throw new Error("ID usaha tidak valid");
  }
  
  console.log("Fetching employees for pelaku usaha ID:", pelakuUsahaId);
  
  // Build the query based on parameters
  let query = supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      whatsapp_number,
      business_role,
      pelaku_usaha_id,
      cabang_id,
      cabang (branch_name)
    `);
    
  // Apply cabang filter if provided
  if (cabangId) {
    query = query.eq("cabang_id", cabangId);
  } else {
    // Otherwise filter by pelaku_usaha_id
    query = query.eq("pelaku_usaha_id", pelakuUsahaId);
  }
  
  // Get results
  const { data, error } = await query.order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }

  console.log("Raw employee data:", data);
  
  // Map the response to the Employee type
  const employees = mapEmployeeData(data, pelakuUsahaId);
  
  console.log("Mapped employees:", employees);
  
  return employees;
}

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
