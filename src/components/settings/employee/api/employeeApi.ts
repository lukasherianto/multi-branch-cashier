
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";

export async function fetchEmployees(pelakuUsahaId: number) {
  console.log("Fetching employees for pelaku usaha ID:", pelakuUsahaId);
  
  if (!pelakuUsahaId) {
    console.error("Invalid pelakuUsahaId:", pelakuUsahaId);
    throw new Error("ID pelaku usaha tidak valid");
  }
  
  const { data, error } = await supabase
    .from("karyawan")
    .select(`
      karyawan_id,
      name,
      email,
      role,
      auth_id,
      is_active,
      pelaku_usaha_id,
      cabang:cabang_id (
        branch_name
      ),
      pelaku_usaha:pelaku_usaha_id (
        business_name
      )
    `)
    .eq("is_active", true)
    .eq("pelaku_usaha_id", pelakuUsahaId)
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }

  console.log("Employees data from database:", data);
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
  
  console.log("Mapping employee data:", employeesData);
  
  return employeesData.map((emp) => {
    // Create a default employee object to ensure type safety
    const defaultEmployee: Employee = {
      karyawan_id: 0,
      name: "Unknown",
      pelaku_usaha_id: 0,
      role: "",
      isSameBusiness: false,
      businessName: 'Tidak diketahui'
    };

    // If emp is null or not an object, return the default employee
    if (!emp || typeof emp !== 'object') {
      console.warn("Invalid employee data:", emp);
      return defaultEmployee;
    }
    
    // Safely extract values with type checks
    const karyawanId = typeof emp.karyawan_id === 'number' ? emp.karyawan_id : 0;
    const name = typeof emp.name === 'string' ? emp.name : "Unknown";
    const email = typeof emp.email === 'string' ? emp.email : undefined;
    const role = typeof emp.role === 'string' ? emp.role : "";
    const authId = typeof emp.auth_id === 'string' ? emp.auth_id : undefined;
    const isActive = typeof emp.is_active === 'boolean' ? emp.is_active : undefined;
    const pelakuUsahaId = typeof emp.pelaku_usaha_id === 'number' ? emp.pelaku_usaha_id : 0;
    
    // Handle nested objects carefully
    let branchName: string | undefined = undefined;
    if (emp.cabang && typeof emp.cabang === 'object' && 'branch_name' in emp.cabang) {
      branchName = typeof emp.cabang.branch_name === 'string' ? emp.cabang.branch_name : undefined;
    }
    
    let businessName = 'Tidak diketahui';
    if (emp.pelaku_usaha && typeof emp.pelaku_usaha === 'object' && 'business_name' in emp.pelaku_usaha) {
      businessName = typeof emp.pelaku_usaha.business_name === 'string' ? 
        emp.pelaku_usaha.business_name : 'Tidak diketahui';
    }
    
    // Use the role for business_role since business_role column doesn't exist
    const businessRole = role;
    
    return {
      karyawan_id: karyawanId,
      name: name,
      email: email,
      role: role,
      business_role: businessRole, // Use role as business_role
      auth_id: authId,
      is_active: isActive,
      pelaku_usaha_id: pelakuUsahaId,
      cabang: branchName ? { branch_name: branchName } : undefined,
      isSameBusiness: pelakuUsahaId === currentPelakuUsahaId,
      businessName: businessName
    };
  });
}
