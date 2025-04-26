import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TenantInfo } from "./types";
import { User } from "@supabase/supabase-js";

interface UseTenantManagementReturn {
  tenants: TenantInfo[];
  selectedTenant: TenantInfo | null;
  changeTenant: (tenantId: number) => Promise<void>;
  setTenants: (tenants: TenantInfo[]) => void;
  setSelectedTenant: (tenant: TenantInfo | null) => void;
}

export const useTenantManagement = (
  user: User | null,
  setPelakuUsaha: (data: any) => void,
  setCabangList: (data: any[]) => void,
  setCabang: (data: any) => void,
  setSelectedCabangId: (id: number | null) => void
): UseTenantManagementReturn => {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);

  const fetchBusinessBranches = async (businessId: number) => {
    try {
      const { data: branchData, error: branchError } = await supabase
        .from("cabang")
        .select("*")
        .eq("pelaku_usaha_id", businessId);

      if (branchError) {
        console.error("Error fetching branches:", branchError);
        return;
      }

      setCabangList(branchData || []);
      
      // If there's only one branch, select it automatically
      if (branchData && branchData.length === 1) {
        setSelectedCabangId(branchData[0].cabang_id);
        setCabang(branchData[0]);
      }
      // If multiple branches, select the headquarters (first branch)
      else if (branchData && branchData.length > 0) {
        setSelectedCabangId(branchData[0].cabang_id);
        setCabang(branchData[0]);
      }
    } catch (error) {
      console.error("Error in fetchBusinessBranches:", error);
    }
  };

  const changeTenant = async (tenantId: number) => {
    const selected = tenants.find(t => t.pelaku_usaha_id === tenantId);
    if (selected) {
      setSelectedTenant(selected);
      setPelakuUsaha(selected);
      const businessId = typeof selected.pelaku_usaha_id === 'string' 
        ? parseInt(selected.pelaku_usaha_id, 10) 
        : selected.pelaku_usaha_id;
      await fetchBusinessBranches(businessId);
    }
  };

  return {
    tenants,
    setTenants,
    selectedTenant,
    setSelectedTenant,
    changeTenant,
  };
};
