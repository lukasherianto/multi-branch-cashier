
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Branch, Employee } from "./types";
import { useAuth } from "@/hooks/auth";

export const useEmployeeData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const loadBranches = async () => {
    try {
      console.log("Loading branches...");
      if (!user) {
        console.error("No authenticated user");
        return;
      }

      const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
        .from("pelaku_usaha")
        .select("pelaku_usaha_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error("Error fetching pelaku usaha:", pelakuUsahaError);
        return;
      }

      if (!pelakuUsaha) {
        console.log("No pelaku usaha found, user needs to create business profile first");
        return;
      }

      const { data: branchesData, error } = await supabase
        .from("cabang")
        .select("*")
        .eq("pelaku_usaha_id", pelakuUsaha.pelaku_usaha_id);

      if (error) throw error;
      console.log("Branches loaded:", branchesData);
      setBranches(branchesData || []);
    } catch (error) {
      console.error("Error loading branches:", error);
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
      console.log("Loading employees...");
      if (!user) {
        console.error("No authenticated user");
        return;
      }

      const { data: currentPelakuUsaha, error: pelakuUsahaError } = await supabase
        .from("pelaku_usaha")
        .select("pelaku_usaha_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error("Error fetching pelaku usaha:", pelakuUsahaError);
        return;
      }

      if (!currentPelakuUsaha) {
        console.log("No pelaku usaha found, user needs to create business profile first");
        return;
      }

      // Use explicit column selection instead of * for better performance and type safety
      const { data: employeesData, error: employeesError } = await supabase
        .from("karyawan")
        .select(`
          karyawan_id,
          name,
          email,
          role,
          auth_id,
          is_active,
          pelaku_usaha_id,
          cabang_id,
          cabang:cabang_id (
            branch_name
          ),
          pelaku_usaha:pelaku_usaha_id (
            business_name
          )
        `);

      if (employeesError) {
        console.error("Error fetching employees:", employeesError);
        throw employeesError;
      }

      console.log("Raw employees data:", employeesData);
      
      // Format the employees data
      const formattedEmployees: Employee[] = (employeesData || []).map(emp => ({
        karyawan_id: emp.karyawan_id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        auth_id: emp.auth_id,
        is_active: emp.is_active,
        pelaku_usaha_id: emp.pelaku_usaha_id,
        cabang_id: emp.cabang_id,
        cabang: emp.cabang,
        pelaku_usaha: emp.pelaku_usaha,
        isSameBusiness: emp.pelaku_usaha_id === currentPelakuUsaha.pelaku_usaha_id,
        businessName: emp.pelaku_usaha?.business_name || 'Tidak diketahui'
      }));

      console.log("Employees loaded:", formattedEmployees);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error("Error loading employees:", error);
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
      loadBranches();
      loadEmployees();
    }
  }, [user]);

  return {
    isLoading,
    setIsLoading,
    employees,
    branches,
    loadEmployees,
  };
};
