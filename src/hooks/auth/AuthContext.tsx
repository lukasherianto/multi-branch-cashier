
import { createContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from "./types";

// Create context with default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userStatusId, setUserStatusId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  useEffect(() => {
    // Get current user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Set up listener for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setUserRole(null);
        setUserStatusId(null);
        setUserDetails(null);
        setPelakuUsaha(null);
        setCabang(null);
        setCabangList([]);
        setSelectedCabangId(null);
        setTenants([]);
        setSelectedTenant(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to fetch user data, business owner data, and branches
  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching user data for ID:", userId);

      // 1. Get profile (if exists)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('business_role, status_id, full_name, whatsapp_number, cabang_id, pelaku_usaha_id')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profileData) {
        setUserDetails(profileData);
        if (profileData.status_id) {
          setUserStatusId(profileData.status_id);
        }
        setUserRole(profileData.business_role || 'user');
        
        // If the user is an employee (kasir), fetch their assigned business
        if (profileData.business_role === 'kasir' && profileData.pelaku_usaha_id) {
          const { data: assignedBusiness, error: assignedError } = await supabase
            .from('pelaku_usaha')
            .select('*')
            .eq('pelaku_usaha_id', profileData.pelaku_usaha_id)
            .maybeSingle();
            
          if (!assignedError && assignedBusiness) {
            setPelakuUsaha(assignedBusiness);
            setSelectedTenant(assignedBusiness);
            
            // Fetch branches for this business
            if (assignedBusiness.pelaku_usaha_id) {
              // Fix: Ensure businessId is a number by converting it if needed
              const businessId = typeof assignedBusiness.pelaku_usaha_id === 'string' 
                ? parseInt(assignedBusiness.pelaku_usaha_id, 10) 
                : assignedBusiness.pelaku_usaha_id;
              
              // Fix: Also ensure cabang_id is a number if it exists
              const cabangId = profileData.cabang_id 
                ? (typeof profileData.cabang_id === 'string' 
                    ? parseInt(profileData.cabang_id, 10) 
                    : profileData.cabang_id) 
                : null;
              
              fetchBusinessBranches(businessId, cabangId);
            }
          }
        }
      }

      // 2. Get business owner data (if user is a business owner)
      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', userId);

      if (pelakuUsahaError) {
        console.error("Error fetching pelaku usaha:", pelakuUsahaError);
      } else if (pelakuUsahaData && pelakuUsahaData.length > 0) {
        console.log("Found business owner data:", pelakuUsahaData);
        setTenants(pelakuUsahaData);
        
        // Select the first business by default
        const defaultBusiness = pelakuUsahaData[0];
        setPelakuUsaha(defaultBusiness);
        setSelectedTenant(defaultBusiness);
        
        // 3. If business owner data found, fetch branches
        // Fix: Ensure businessId is a number
        const businessId = typeof defaultBusiness.pelaku_usaha_id === 'string' 
          ? parseInt(defaultBusiness.pelaku_usaha_id, 10) 
          : defaultBusiness.pelaku_usaha_id;
        
        const { data: cabangData, error: cabangError } = await supabase
          .from('cabang')
          .select('*')
          .eq('pelaku_usaha_id', businessId)
          .order('cabang_id', { ascending: true });

        if (cabangError) {
          console.error("Error fetching branches:", cabangError);
        } else if (cabangData && cabangData.length > 0) {
          console.log("Found branches:", cabangData);
          setCabangList(cabangData);
          
          // Select first branch as default
          const defaultCabang = cabangData[0];
          setCabang(defaultCabang);
          setSelectedCabangId(defaultCabang.cabang_id);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch branches for a specific business
  const fetchBusinessBranches = async (businessId: number, defaultBranchId?: number | null) => {
    try {
      const { data: cabangData, error: cabangError } = await supabase
        .from('cabang')
        .select('*')
        .eq('pelaku_usaha_id', businessId)
        .order('cabang_id', { ascending: true });

      if (cabangError) {
        console.error("Error fetching branches for business:", cabangError);
        return;
      }
      
      if (cabangData && cabangData.length > 0) {
        setCabangList(cabangData);
        
        // If specific branch ID is provided, select it
        if (defaultBranchId) {
          const selectedBranch = cabangData.find(b => b.cabang_id === defaultBranchId);
          if (selectedBranch) {
            setCabang(selectedBranch);
            setSelectedCabangId(selectedBranch.cabang_id);
            return;
          }
        }
        
        // Otherwise select first branch as default
        const defaultCabang = cabangData[0];
        setCabang(defaultCabang);
        setSelectedCabangId(defaultCabang.cabang_id);
      } else {
        setCabangList([]);
        setCabang(null);
        setSelectedCabangId(null);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };
  
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
