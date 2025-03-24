
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";
import { mapEmployeeResponse } from "./employeeMappers";

/**
 * Fetches employees for a specific business
 */
export async function fetchEmployees(pelakuUsahaId: number) {
  if (!pelakuUsahaId) {
    console.error("Invalid pelakuUsahaId:", pelakuUsahaId);
    throw new Error("ID usaha tidak valid");
  }
  
  console.log("Fetching employees for pelaku usaha ID:", pelakuUsahaId);
  
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      whatsapp_number,
      business_role,
      pelaku_usaha_id,
      cabang_id,
      cabang (branch_name)
    `)
    .eq("business_role", "kasir")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }

  console.log("Raw employee data:", data);
  
  // Map the response to the Employee type
  const employees = data.map(item => mapEmployeeResponse(item, pelakuUsahaId));
  
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
