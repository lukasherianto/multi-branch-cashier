
import { User } from "@supabase/supabase-js";

export type UserRole = 'pelaku_usaha' | 'admin' | 'kasir' | 'pelayan';

export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  userStatusId: number | null;
  pelakuUsaha: any;
  cabang: any;
  cabangList: any[];
  selectedCabangId: number | null;
  setSelectedCabangId: (id: number | null) => void;
  isLoading: boolean;
}
