
import { User } from "@supabase/supabase-js";

export type UserRole = 'pelaku_usaha' | 'admin' | 'kasir' | 'pelayan' | 'gudang';

export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  userStatusId: number | null;
  pelakuUsaha: any;
  cabang: any;
  cabangList: any[];
  selectedCabangId: number | null;
  selectedBranchId: number | null;  // Added this property to match what's used in useEmployeeData
  setSelectedCabangId: (id: number | null) => void;
  isLoading: boolean;
  signIn?: (email: string, password: string) => Promise<any>;
  signOut?: () => Promise<void>;
  resetPassword?: (email: string) => Promise<any>;
  setNewPassword?: (password: string) => Promise<any>;
}
