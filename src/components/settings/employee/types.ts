
export interface Branch {
  cabang_id: number;
  branch_name: string;
  address?: string;
  contact_whatsapp?: string;
}

export interface Employee {
  karyawan_id: number;
  name: string;
  email?: string;
  role?: string;
  auth_id?: string;
  is_active?: boolean;
  pelaku_usaha_id?: number;
  cabang_id?: number;
  cabang?: {
    branch_name: string;
  };
  pelaku_usaha?: {
    business_name: string;
  };
  isSameBusiness?: boolean;
  businessName?: string;
}
