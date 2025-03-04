
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Branch, Employee } from "./types";
import { useAuth } from "@/hooks/auth";
import { useBranchData } from "./hooks/useBranchData";
import { useEmployeeList } from "./hooks/useEmployeeList";
import { useBusinessProfile } from "./hooks/useBusinessProfile";

export const useEmployeeData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { branches, loadBranches } = useBranchData();
  const { employees, loadEmployees } = useEmployeeList();
  const { pelakuUsahaId, loadBusinessProfile } = useBusinessProfile();

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        console.error("No authenticated user");
        setError("Anda harus login terlebih dahulu");
        return;
      }

      // Load business profile
      const businessId = await loadBusinessProfile(user.id);
      if (!businessId) {
        return; // Error already set in useBusinessProfile
      }

      // Load employees
      await loadEmployees(businessId);
      
      // Load branches
      await loadBranches(businessId);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || "Gagal memuat data");
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    setIsLoading,
    employees,
    branches,
    loadEmployees: loadAllData,
    error: error
  };
};
