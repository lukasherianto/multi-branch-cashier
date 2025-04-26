
import { createContext, ReactNode } from "react";
import { AuthContextType } from "./types";
import { useAuthState } from "./useAuthState";
import { useBusinessData } from "./useBusinessData";
import { useTenantManagement } from "./useTenantManagement";
import { useUserDetails } from "./useUserDetails";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, userRole, userStatusId, isLoading } = useAuthState();
  const {
    userDetails,
    setUserDetails,
    pelakuUsaha,
    setPelakuUsaha,
    cabang,
    setCabang,
    cabangList,
    setCabangList,
    selectedCabangId,
    setSelectedCabangId,
  } = useUserDetails();

  // Use the tenant management hook
  const {
    tenants,
    selectedTenant,
    changeTenant,
  } = useTenantManagement(
    user,
    setPelakuUsaha,
    setCabangList,
    setCabang,
    setSelectedCabangId
  );

  // Use the business data hook
  useBusinessData(
    user,
    selectedCabangId,
    setPelakuUsaha,
    setCabangList,
    setCabang,
    setSelectedCabangId
  );

  const value: AuthContextType = {
    user,
    userRole,
    userStatusId,
    userDetails,
    pelakuUsaha,
    cabang,
    cabangList,
    selectedCabangId,
    setSelectedCabangId,
    tenants,
    selectedTenant,
    changeTenant,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
