
import { User } from "@supabase/supabase-js";

export type UserRole = 'pelaku_usaha' | 'admin' | 'kasir' | 'pelayan';

export interface UserDetails {
  business_role?: string;
  status_id?: number;
}

export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  userStatusId: number | null;
  userDetails?: UserDetails;
  pelakuUsaha: any;
  cabang: any;
  cabangList: any[];
  selectedCabangId: number | null;
  setSelectedCabangId: (id: number | null) => void;
  isLoading: boolean;
}
