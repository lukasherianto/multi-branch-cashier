
import { supabase } from "@/integrations/supabase/client";
import { EmployeeFormData } from "../types";
import { mapRoleToStatusId } from "../utils/roleMapper";

export async function getPelakuUsahaId(userId: string) {
  const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
    .from("pelaku_usaha")
    .select("pelaku_usaha_id")
    .eq("user_id", userId)
    .single();

  if (pelakuUsahaError || !pelakuUsaha) {
    console.error("Error fetching pelaku usaha:", pelakuUsahaError);
    throw new Error("Data usaha tidak ditemukan");
  }

  return pelakuUsaha.pelaku_usaha_id;
}

export async function validateBranchId(cabangId: number) {
  // Verify if the selected branch exists
  const { data: branchData, error: branchError } = await supabase
    .from("cabang")
    .select("cabang_id")
    .eq("cabang_id", cabangId)
    .single();

  if (branchError || !branchData) {
    console.error("Branch validation error:", branchError);
    throw new Error("Cabang yang dipilih tidak valid");
  }

  return true;
}

export async function createAuthAccount(data: EmployeeFormData & { cabang_id?: string }) {
  const role = data.business_role; // Use business_role as role

  // Create Supabase auth account for employee with cabang_id
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.name,
        whatsapp_number: data.whatsapp_contact,
        is_employee: true,
        role: role, // Store as role in user metadata
        business_role: role, // Also store as business_role
        cabang_id: data.cabang_id || "0" // Include cabang_id in user metadata
      }
    }
  });

  if (authError) {
    console.error("Auth error:", authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("Failed to create employee account");
  }

  return authData.user;
}

export async function updateProfileStatus(userId: string, role: string) {
  // Update both role and business_role in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      role: role,
      business_role: role
    })
    .eq('id', userId);

  if (profileError) {
    console.error("Error updating profile role:", profileError);
    // Don't throw, just log the error
  }
}

// This function is no longer needed as we're not creating karyawan records anymore
// Instead, we'll use the profiles table for employee data
