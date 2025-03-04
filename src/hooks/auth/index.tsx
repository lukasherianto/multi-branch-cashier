
import { useState, useContext } from "react";
import { useAuthState } from "./useAuthState";
import { useBusinessData } from "./useBusinessData";
import { useBranchSelection } from "./useBranchSelection";
import AuthContext from "./AuthContext";
import { initializeMenuAccess } from "./initializeAppData";
import { useEffect } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Auth state
  const { user, userRole, userStatusId, isLoading, setUser, setUserRole, setUserStatusId } = useAuthState();
  
  // Business state
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [cabang, setCabang] = useState<any>(null);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);

  // Initialize app data when user is authenticated
  useEffect(() => {
    if (user && userRole) {
      // Initialize menu access data
      initializeMenuAccess().catch(error => {
        console.error("Failed to initialize app data:", error);
      });
    }
  }, [user, userRole]);

  // Fetch business data when user or selectedCabangId changes
  useBusinessData(
    user,
    selectedCabangId,
    setPelakuUsaha,
    setCabangList,
    setCabang,
    setSelectedCabangId
  );

  // Update selected branch when selectedCabangId changes
  useBranchSelection(selectedCabangId, cabangList, setCabang);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole,
      userStatusId,
      pelakuUsaha, 
      cabang,
      cabangList,
      selectedCabangId,
      setSelectedCabangId,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
