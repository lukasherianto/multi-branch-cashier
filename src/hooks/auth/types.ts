
import { User } from "@supabase/supabase-js";

export type UserRole = 'pelaku_usaha' | 'admin' | 'kasir' | 'pelayan';

export interface UserDetails {
  business_role?: string;
  status_id?: number;
  full_name?: string;
  whatsapp_number?: string;
  cabang_id?: number;
  pelaku_usaha_id?: number;
}

export interface TenantInfo {
  pelaku_usaha_id: number;
  business_name: string;
  logo_url?: string;
}

export interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  userStatusId: number | null;
  userDetails?: UserDetails;
  pelakuUsaha: any;
  cabang: any;
  cabangList: any[];
  selectedCabangId: number | null;
  setSelectedCabangId: (id: number | null) => void;
  tenants: TenantInfo[];
  selectedTenant: TenantInfo | null;
  changeTenant: (tenantId: number) => Promise<void>;
  isLoading: boolean;
}

