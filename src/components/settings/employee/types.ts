
export interface Branch {
  cabang_id: number;
  branch_name: string;
}

export interface Employee {
  karyawan_id: number;
  name: string;
  email?: string;
  role: string;
  business_role?: string; // Made optional since it's derived from role
  auth_id?: string;
  is_active?: boolean;
  pelaku_usaha_id: number;
  isSameBusiness?: boolean;
  businessName?: string;
  whatsapp_contact?: string;
  cabang?: {
    branch_name: string;
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
