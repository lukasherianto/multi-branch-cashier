
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

export async function createAuthAccount(data: EmployeeFormData) {
  const statusId = mapRoleToStatusId(data.business_role);

  // Create Supabase auth account for employee
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.name,
        whatsapp_number: data.whatsapp_contact,
        is_employee: true,
        business_role: data.business_role,
        status_id: statusId
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

export async function updateProfileStatus(userId: string, statusId: number) {
  // Update the status_id in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ status_id: statusId })
    .eq('id', userId);

  if (profileError) {
    console.error("Error updating profile status_id:", profileError);
    // Don't throw, just log the error
  }
}

export async function createEmployeeRecord(employeeData: any) {
  const { data: insertedEmployee, error: employeeError } = await supabase
    .from("karyawan")
    .insert(employeeData)
    .select()
    .single();

  if (employeeError) {
    console.error("Employee insert error:", employeeError);
    throw new Error(employeeError.message);
  }

  return insertedEmployee;
}
