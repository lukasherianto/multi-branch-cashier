
import { createContext, useState, ReactNode } from "react";
import { AuthContextType } from "./types";
import { useAuthState } from "./useAuthState";
import { useBusinessData } from "./useBusinessData";
import { useTenantManagement } from "./useTenantManagement";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, userRole, userStatusId, isLoading, setUser, setUserRole, setUserStatusId } = useAuthState();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);

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

  // Value to be shared through context
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
