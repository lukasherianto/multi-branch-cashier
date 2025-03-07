
export interface Branch {
  cabang_id: number;
  branch_name: string;
  status?: number; // Adding status field to identify HQ branches
}

export interface Employee {
  karyawan_id: number; // Kept for compatibility, not using actual IDs anymore
  name: string;
  email?: string;
  role: string;
  business_role?: string;
  auth_id?: string;
  is_active?: boolean;
  pelaku_usaha_id: number;
  isSameBusiness?: boolean;
  businessName?: string;
  whatsapp_contact?: string;
  cabang_id?: number;
  cabang?: {
    branch_name: string;
    status?: number; // Added status to identify headquarters branch
  };
  pelaku_usaha?: {
    business_name: string;
  };
}

export interface EmployeeFormData {
  name: string;
  email: string;
  whatsapp_contact: string;
  role: string;
  business_role: string;
  cabang_id: string;
  password: string;
}
