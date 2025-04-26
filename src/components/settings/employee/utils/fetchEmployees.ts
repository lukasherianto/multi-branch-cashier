
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "../types";

export const fetchEmployeesFromKaryawan = async (currentBusinessId: number) => {
  const { data: karyawanData, error: karyawanError } = await supabase
    .from("karyawan")
    .select(`
      karyawan_id,
      name,
      email,
      role,
      business_role,
      auth_id,
      is_active,
      pelaku_usaha_id,
      cabang_id,
      cabang:cabang_id (
        branch_name
      ),
      pelaku_usaha:pelaku_usaha_id (
        business_name
      ),
      profiles:auth_id (
        full_name,
        whatsapp_number
      )
    `)
    .order("pelaku_usaha_id", { ascending: false });

  if (karyawanError) {
    console.error("Error fetching from karyawan table:", karyawanError);
    return null;
  }

  if (!karyawanData?.length) {
    console.log("No data from karyawan table");
    return null;
  }

  return karyawanData.map(employee => ({
    karyawan_id: employee.karyawan_id,
    name: employee.name,
    email: employee.email || "",
    role: employee.role || employee.business_role,
    auth_id: employee.auth_id,
    is_active: employee.is_active,
    pelaku_usaha_id: employee.pelaku_usaha_id,
    cabang_id: employee.cabang_id,
    cabang: employee.cabang,
    pelaku_usaha: employee.pelaku_usaha,
    isSameBusiness: employee.pelaku_usaha_id === currentBusinessId,
    businessName: employee.pelaku_usaha?.business_name || 'Tidak diketahui'
  }));
};

export const fetchEmployeesFromProfiles = async (currentBusinessId: number) => {
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      role,
      business_role,
      is_employee,
      pelaku_usaha_id,
      cabang_id,
      cabang:cabang_id (
        branch_name
      ),
      pelaku_usaha:pelaku_usaha_id (
        business_name
      )
    `)
    .eq("is_employee", true);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    return [];
  }

  return profilesData.map(profile => ({
    karyawan_id: parseInt(profile.id.replace(/-/g, "").substring(0, 8), 16),
    name: profile.full_name,
    email: "",
    role: profile.role || profile.business_role,
    auth_id: profile.id,
    is_active: true,
    pelaku_usaha_id: profile.pelaku_usaha_id,
    cabang_id: profile.cabang_id,
    cabang: profile.cabang,
    pelaku_usaha: profile.pelaku_usaha,
    isSameBusiness: profile.pelaku_usaha_id === currentBusinessId,
    businessName: profile.pelaku_usaha?.business_name || 'Tidak diketahui'
  }));
};
