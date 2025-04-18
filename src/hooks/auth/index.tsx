
import { useAuth as useAuthOriginal } from './useAuth';
import { AuthProvider as AuthProviderOriginal } from './AuthContext';

export const AuthProvider = AuthProviderOriginal;

export const useAuth = () => {
  const auth = useAuthOriginal();
  
  // Add isEmployee property if it's missing from the original hook
  return {
    ...auth,
    isEmployee: auth.user?.user_metadata?.is_employee || 
               (auth.userDetails?.business_role !== undefined && 
                auth.userDetails?.business_role !== null)
  };
};
