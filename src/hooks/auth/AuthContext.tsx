
import { createContext, useState, ReactNode } from "react";
import { AuthContextType } from "./types";
import { useAuthState } from "./useAuthState";
import { useBusinessData } from "./useBusinessData";

// Create context with default undefined value
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
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // Use the business data hook
  useBusinessData(
    user,
    selectedCabangId,
    setPelakuUsaha,
    setCabangList,
    setCabang,
    setSelectedCabangId
  );

  // Function to change selected tenant/business
  const changeTenant = async (tenantId: number) => {
    const selected = tenants.find(t => t.pelaku_usaha_id === tenantId);
    if (selected) {
      setSelectedTenant(selected);
      setPelakuUsaha(selected);
      // Fix: Ensure businessId is a number
      const businessId = typeof selected.pelaku_usaha_id === 'string' 
        ? parseInt(selected.pelaku_usaha_id, 10) 
        : selected.pelaku_usaha_id;
      await fetchBusinessBranches(businessId);
    }
  };

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
