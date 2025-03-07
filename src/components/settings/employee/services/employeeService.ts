
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
        role: role, // Use role instead of business_role to match database column
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
  // Update the role in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: role }) // Use role column, not business_role
    .eq('id', userId);

  if (profileError) {
    console.error("Error updating profile role:", profileError);
    // Don't throw, just log the error
  }
}

export async function createEmployeeRecord(employeeData: any) {
  console.log("Creating employee record with data:", employeeData);
  
  // Ensure that auth_id is correctly set
  if (!employeeData.auth_id) {
    console.error("Missing auth_id in employee data!");
    throw new Error("UUID pengguna tidak valid");
  }

  // Insert record into karyawan table, connecting to the auth UUID
  const { data: insertedEmployee, error: employeeError } = await supabase
    .from("karyawan")
    .insert(employeeData)
    .select()
    .single();

  if (employeeError) {
    console.error("Employee insert error:", employeeError);
    throw new Error(employeeError.message);
  }

  console.log("Successfully inserted employee:", insertedEmployee);
  return insertedEmployee;
}
