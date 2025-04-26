
import { useSession } from "./useSession";
import { useUserRole } from "./useUserRole";
import { User } from "@supabase/supabase-js";
import { UserRole } from "./types";

interface UseAuthStateReturn {
  user: User | null;
  userRole: UserRole | null;
  userStatusId: number | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setUserRole: (role: UserRole | null) => void;
  setUserStatusId: (statusId: number | null) => void;
}

export const useAuthState = (): UseAuthStateReturn => {
  const { user, isLoading, setUser } = useSession();
  const { userRole, userStatusId, setUserRole, setUserStatusId } = useUserRole(user);

  return { 
    user, 
    userRole, 
    userStatusId, 
    isLoading, 
    setUser, 
    setUserRole, 
    setUserStatusId 
  };
};

