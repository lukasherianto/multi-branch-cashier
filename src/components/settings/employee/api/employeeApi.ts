
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";

export async function fetchEmployees(pelakuUsahaId: number) {
  console.log("Fetching employees for pelaku usaha ID:", pelakuUsahaId);
  
  if (!pelakuUsahaId) {
    console.error("Invalid pelakuUsahaId:", pelakuUsahaId);
    throw new Error("ID pelaku usaha tidak valid");
  }
  
  // Get all employees from profiles table where is_employee is true
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      whatsapp_number,
      business_role,
      is_employee,
      status_id
    `)
    .eq("is_employee", true);

  if (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }

  console.log("Employees data from profiles table:", data);
  return data;
}

export async function fetchUserPelakuUsaha(userId: string) {
  if (!userId) {
    console.error("Invalid userId:", userId);
    throw new Error("ID pengguna tidak valid");
  }
  
  const { data, error } = await supabase
    .from("pelaku_usaha")
    .select("pelaku_usaha_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching pelaku usaha:", error);
    throw error;
  }

  return data;
}

// Map raw data to Employee objects with safety checks
export function mapEmployeeData(employeesData: any[] | null, currentPelakuUsahaId: number): Employee[] {
  if (!employeesData) return [];
  
  console.log("Mapping employee data from profiles:", employeesData);
  
  return employeesData.map((emp) => {
    // Create a default employee object to ensure type safety
    const defaultEmployee: Employee = {
      karyawan_id: 0,
      name: "Unknown",
      pelaku_usaha_id: currentPelakuUsahaId,
      role: "",
      isSameBusiness: true,
      businessName: 'Tidak diketahui'
    };

    // If emp is null or not an object, return the default employee
    if (!emp || typeof emp !== 'object') {
      console.warn("Invalid employee data:", emp);
      return defaultEmployee;
    }
    
    // Safely extract values with type checks
    const authId = typeof emp.id === 'string' ? emp.id : "";
    const name = typeof emp.full_name === 'string' ? emp.full_name : "Unknown";
    const whatsappContact = typeof emp.whatsapp_number === 'string' ? emp.whatsapp_number : undefined;
    const businessRole = typeof emp.business_role === 'string' ? emp.business_role : "";
    
    // Create employee object from profiles data
    return {
      karyawan_id: 0, // Use 0 as placeholder since profiles doesn't have karyawan_id
      name: name,
      email: "", // Email not available in profiles, would need to join with auth.users
      role: businessRole,
      business_role: businessRole,
      auth_id: authId,
      is_active: true,
      pelaku_usaha_id: currentPelakuUsahaId,
      whatsapp_contact: whatsappContact,
      isSameBusiness: true,
      businessName: 'Current Business'
    };
  });
}
