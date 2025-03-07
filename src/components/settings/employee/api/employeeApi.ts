import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";

export async function fetchEmployees(pelakuUsahaId: number, cabangId?: number) {
  console.log("Fetching employees for pelaku usaha ID:", pelakuUsahaId, "and cabang ID:", cabangId);
  
  if (!pelakuUsahaId) {
    console.error("Invalid pelakuUsahaId:", pelakuUsahaId);
    throw new Error("ID pelaku usaha tidak valid");
  }
  
  // Get all employees from profiles table where is_employee is true
  // and belongs to the current pelaku_usaha_id or has the same cabang_id
  let profileQuery = supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      whatsapp_number,
      is_employee,
      status_id,
      pelaku_usaha_id,
      cabang_id,
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

  console.log("Employee profiles data:", profileData);

  // Get employee data from karyawan table that belongs to the current business or branch
  let karyawanQuery = supabase
    .from("karyawan")
    .select(`
      karyawan_id,
      name,
      email,
      role,
      whatsapp_contact,
      auth_id,
      is_active,
      cabang_id,
      cabang (
        branch_name
      ),
      pelaku_usaha_id,
      pelaku_usaha (
        business_name
      )
    `)
    .order('name', { ascending: true });
  
  // Add filter for cabang_id if provided
  if (cabangId) {
    karyawanQuery = karyawanQuery.eq("cabang_id", cabangId);
  } else {
    // Otherwise filter by pelaku_usaha_id
    karyawanQuery = karyawanQuery.eq("pelaku_usaha_id", pelakuUsahaId);
  }

  const { data: karyawanData, error: karyawanError } = await karyawanQuery;

  if (karyawanError) {
    console.error("Error fetching karyawan data:", karyawanError);
    throw karyawanError;
  }

  console.log("Karyawan data:", karyawanData);

  // Combine the data from both sources
  // Use karyawan data as base, with additional data from profiles when available
  const combinedData = [];
  
  // First add all karyawan data
  karyawanData.forEach(karyawan => {
    combinedData.push({
      source: 'karyawan',
      karyawan_id: karyawan.karyawan_id,
      name: karyawan.name,
      email: karyawan.email,
      role: karyawan.role,
      business_role: karyawan.role, // Gunakan nilai dari kolom role
      auth_id: karyawan.auth_id,
      is_active: karyawan.is_active,
      pelaku_usaha_id: karyawan.pelaku_usaha_id,
      whatsapp_contact: karyawan.whatsapp_contact,
      cabang_id: karyawan.cabang_id,
      cabang: karyawan.cabang,
      pelaku_usaha: karyawan.pelaku_usaha
    });
  });
  
  // Then add profile data that doesn't have corresponding karyawan entry
  profileData.forEach(profile => {
    const existsInKaryawan = combinedData.some(emp => emp.auth_id === profile.id);
    
    if (!existsInKaryawan) {
      // Since business_role column has been removed from profiles,
      // We need to get the role from user_status table or use a default value
      combinedData.push({
        source: 'profile',
        karyawan_id: 0, // Default value for employees without karyawan entry
        name: profile.full_name,
        email: "", // Email not available in profiles
        role: "employee", // Default role
        business_role: "employee", // Default business_role
        auth_id: profile.id,
        is_active: true,
        pelaku_usaha_id: profile.pelaku_usaha_id || pelakuUsahaId,
        whatsapp_contact: profile.whatsapp_number,
        cabang_id: profile.cabang_id,
        cabang: profile.cabang
      });
    }
  });

  console.log("Combined employee data:", combinedData);
  return combinedData;
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
    const authId = typeof emp.auth_id === 'string' ? emp.auth_id : "";
    const name = typeof emp.name === 'string' ? emp.name : "Unknown";
    const email = typeof emp.email === 'string' ? emp.email : "";
    const whatsappContact = typeof emp.whatsapp_contact === 'string' ? emp.whatsapp_contact : undefined;
    const role = typeof emp.role === 'string' ? emp.role : "";
    const businessRole = typeof emp.business_role === 'string' ? emp.business_role : role; // Gunakan role jika business_role tidak ada
    const cabangId = emp.cabang_id || null;
    
    // Get karyawan-specific data if available
    const karyawanId = emp.karyawan_id || 0;
    const cabangData = emp.cabang || null;
    const pelakuUsahaId = emp.pelaku_usaha_id || currentPelakuUsahaId;
    const pelakuUsahaData = emp.pelaku_usaha || null;
    
    // Determine if employee belongs to current business
    const isSameBusiness = pelakuUsahaId === currentPelakuUsahaId;
    const businessName = pelakuUsahaData?.business_name || 'Current Business';
    
    // Create employee object
    return {
      karyawan_id: karyawanId,
      name: name,
      email: email,
      role: role,
      business_role: businessRole, // Pastikan business_role diisi dengan benar
      auth_id: authId,
      is_active: true,
      pelaku_usaha_id: pelakuUsahaId,
      whatsapp_contact: whatsappContact,
      isSameBusiness: isSameBusiness,
      businessName: businessName,
      cabang_id: cabangId,
      cabang: cabangData
    };
  });
}
