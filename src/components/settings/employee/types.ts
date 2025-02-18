
export interface Branch {
  cabang_id: number;
  branch_name: string;
}

export interface Employee {
  karyawan_id: number;
  name: string;
  email?: string;
  role: string;
  auth_id?: string;
  is_active?: boolean;
  cabang?: {
    branch_name: string;
  };
}

export interface EmployeeFormData {
  name: string;
  email: string;
  whatsapp_contact: string;
  role: string;
  cabang_id: string;
  password: string;
}
