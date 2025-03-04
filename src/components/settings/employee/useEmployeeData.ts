
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Branch, Employee } from "./types";
import { useAuth } from "@/hooks/auth";

export const useEmployeeData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadBranches = async () => {
    try {
      console.log("Loading branches...");
      if (!user) {
        console.error("No authenticated user");
        setError("Anda harus login terlebih dahulu");
        return;
      }

      const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
        .from("pelaku_usaha")
        .select("pelaku_usaha_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error("Error fetching pelaku usaha:", pelakuUsahaError);
        setError(pelakuUsahaError.message);
        return;
      }

      if (!pelakuUsaha) {
        console.log("No pelaku usaha found, user needs to create business profile first");
        setError("Anda perlu membuat profil usaha terlebih dahulu");
        return;
      }

      const { data: branchesData, error } = await supabase
        .from("cabang")
        .select("*")
        .eq("pelaku_usaha_id", pelakuUsaha.pelaku_usaha_id)
        .order('branch_name', { ascending: true });

      if (error) {
        console.error("Error loading branches:", error);
        setError(error.message);
        return;
      }
      
      console.log("Branches loaded:", branchesData);
      setBranches(branchesData || []);
    } catch (err: any) {
      console.error("Error loading branches:", err);
      setError(err.message || "Gagal memuat data cabang");
      toast({
        title: "Error",
        description: "Gagal memuat data cabang",
        variant: "destructive",
      });
    }
  };

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading employees...");
      
      if (!user) {
        console.error("No authenticated user");
        setError("Anda harus login terlebih dahulu");
        return;
      }

      const { data: currentPelakuUsaha, error: pelakuUsahaError } = await supabase
        .from("pelaku_usaha")
        .select("pelaku_usaha_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error("Error fetching pelaku usaha:", pelakuUsahaError);
        setError(pelakuUsahaError.message);
        return;
      }

      if (!currentPelakuUsaha) {
        console.log("No pelaku usaha found, user needs to create business profile first");
        setError("Anda perlu membuat profil usaha terlebih dahulu");
        return;
      }

      const { data: employeesData, error: employeesError } = await supabase
        .from("karyawan")
        .select(`
          karyawan_id,
          name,
          email,
          role,
          business_role,
          auth_id,
          is_active,
          pelaku_usaha_id,
          cabang:cabang_id (
            branch_name
          ),
          pelaku_usaha:pelaku_usaha_id (
            business_name
          )
        `)
        .eq("is_active", true)
        .eq("pelaku_usaha_id", currentPelakuUsaha.pelaku_usaha_id)
        .order('name', { ascending: true });

      if (employeesError) {
        console.error("Error fetching employees:", employeesError);
        setError(employeesError.message);
        return;
      }

      // Safely handle the data and ensure we're working with valid objects
      const formattedEmployees = employeesData ? employeesData.map((emp) => {
        // Create a default employee object to ensure type safety
        const defaultEmployee: Employee = {
          karyawan_id: 0,
          name: "Unknown",
          pelaku_usaha_id: 0,
          role: "",
          isSameBusiness: false,
          businessName: 'Tidak diketahui'
        };

        // If emp is null or not an object, return the default employee
        if (!emp || typeof emp !== 'object') {
          return defaultEmployee;
        }
        
        // Now TypeScript knows emp is not null and is an object
        // Safely extract values with nullish coalescing for primitive types
        const karyawanId = typeof emp.karyawan_id === 'number' ? emp.karyawan_id : 0;
        const name = typeof emp.name === 'string' ? emp.name : "Unknown";
        const email = typeof emp.email === 'string' ? emp.email : undefined;
        const role = typeof emp.role === 'string' ? emp.role : "";
        const businessRole = typeof emp.business_role === 'string' ? emp.business_role : undefined;
        const authId = typeof emp.auth_id === 'string' ? emp.auth_id : undefined;
        const isActive = typeof emp.is_active === 'boolean' ? emp.is_active : undefined;
        const pelakuUsahaId = typeof emp.pelaku_usaha_id === 'number' ? emp.pelaku_usaha_id : 0;
        
        // Handle nested objects carefully
        let branchName: string | undefined = undefined;
        if (emp.cabang && typeof emp.cabang === 'object' && 'branch_name' in emp.cabang) {
          branchName = typeof emp.cabang.branch_name === 'string' ? emp.cabang.branch_name : undefined;
        }
        
        let businessName = 'Tidak diketahui';
        if (emp.pelaku_usaha && typeof emp.pelaku_usaha === 'object' && 'business_name' in emp.pelaku_usaha) {
          businessName = typeof emp.pelaku_usaha.business_name === 'string' ? 
            emp.pelaku_usaha.business_name : 'Tidak diketahui';
        }
        
        return {
          karyawan_id: karyawanId,
          name: name,
          email: email,
          role: role,
          business_role: businessRole,
          auth_id: authId,
          is_active: isActive,
          pelaku_usaha_id: pelakuUsahaId,
          cabang: branchName ? { branch_name: branchName } : undefined,
          isSameBusiness: pelakuUsahaId === currentPelakuUsaha.pelaku_usaha_id,
          businessName: businessName
        };
      }) : [];

      console.log("Employees loaded:", formattedEmployees);
      setEmployees(formattedEmployees);
      
      // Load branches if not already loaded
      if (branches.length === 0) {
        await loadBranches();
      }
    } catch (err: any) {
      console.error("Error loading employees:", err);
      setError(err.message || "Gagal memuat data karyawan");
      toast({
        title: "Error",
        description: "Gagal memuat data karyawan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEmployees();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    setIsLoading,
    employees,
    branches,
    loadEmployees,
    error
  };
};
