
import { Employee } from "../types";

/**
 * Map profile data to Employee objects
 */
export function mapEmployeeData(profilesData: any[] | null, currentPelakuUsahaId: number): Employee[] {
  if (!profilesData) return [];
  
  console.log("Mapping employee data from profiles:", profilesData);
  
  return profilesData.map((profile) => {
    // Create a default employee object to ensure type safety
    const defaultEmployee: Employee = {
      karyawan_id: 0, // We'll use profile.id instead but maintain the property for compatibility
      name: "Unknown",
      pelaku_usaha_id: currentPelakuUsahaId, 
      role: "",
      isSameBusiness: true,
      businessName: 'Tidak diketahui'
    };

    // If profile is null or not an object, return the default employee
    if (!profile || typeof profile !== 'object') {
      console.warn("Invalid employee profile data:", profile);
      return defaultEmployee;
    }
    
    // Safely extract values with type checks
    const authId = profile.id || "";
    const name = profile.full_name || "Unknown";
    const whatsappContact = profile.whatsapp_number || profile.whatsapp_contact || "";
    const role = profile.role || "";
    const businessRole = profile.business_role || role;
    const cabangId = profile.cabang_id || null;
    const cabangData = profile.cabang || null;
    const pelakuUsahaId = profile.pelaku_usaha_id || currentPelakuUsahaId;
    
    // Determine if employee belongs to current business
    const isSameBusiness = pelakuUsahaId === currentPelakuUsahaId;
    
    // Create employee object
    return {
      karyawan_id: 0, // Use 0 as this is no longer relevant but kept for compatibility
      name: name,
      role: role,
      business_role: businessRole,
      auth_id: authId,
      is_active: true, // Assume active since we don't have this info in profiles
      pelaku_usaha_id: pelakuUsahaId,
      whatsapp_contact: whatsappContact,
      isSameBusiness: isSameBusiness,
      businessName: isSameBusiness ? 'Current Business' : 'External Business',
      cabang_id: cabangId,
      cabang: cabangData
    };
  });
}
