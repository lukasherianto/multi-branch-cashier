
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
      const formattedEmployees = employeesData ? employeesData.map(emp => {
        // Ensure emp is not null and is an object type before proceeding
        if (emp && typeof emp === 'object') {
          const pelakuUsahaId = emp.pelaku_usaha_id as number | undefined;
          const businessName = emp.pelaku_usaha ? 
            (emp.pelaku_usaha as { business_name?: string }).business_name || 'Tidak diketahui' : 
            'Tidak diketahui';
            
          return {
            karyawan_id: emp.karyawan_id as number,
            name: emp.name as string,
            email: emp.email as string | undefined,
            role: emp.role as string,
            business_role: emp.business_role as string | undefined,
            auth_id: emp.auth_id as string | undefined,
            is_active: emp.is_active as boolean | undefined,
            pelaku_usaha_id: pelakuUsahaId || 0,
            cabang: emp.cabang as { branch_name: string } | undefined,
            isSameBusiness: pelakuUsahaId === currentPelakuUsaha.pelaku_usaha_id,
            businessName: businessName
          };
        }
        // Return a valid Employee object with default values if emp is not valid
        return {
          karyawan_id: 0,
          name: "Unknown",
          pelaku_usaha_id: 0,
          role: "",
          isSameBusiness: false,
          businessName: 'Tidak diketahui'
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
