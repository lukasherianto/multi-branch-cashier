
import { useSession } from "./useSession";
import { useUserRole } from "./useUserRole";

export const useAuthState = () => {
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
