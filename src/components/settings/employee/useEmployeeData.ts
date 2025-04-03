
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

      // First try to get employees directly from karyawan table with joined profiles
      const { data: karyawanData, error: karyawanError } = await supabase
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
          cabang_id,
          cabang:cabang_id (
            branch_name
          ),
          pelaku_usaha:pelaku_usaha_id (
            business_name
          ),
          profiles:auth_id (
            full_name,
            whatsapp_number
          )
        `)
        .order("pelaku_usaha_id", { ascending: false });

      if (karyawanError) {
        console.error("Error fetching karyawan data:", karyawanError);
        // If karyawan table query fails, fallback to profiles
        loadEmployeesFromProfiles(currentPelakuUsaha.pelaku_usaha_id);
        return;
      }

      if (karyawanData && karyawanData.length > 0) {
        console.log("Employee data loaded from karyawan table:", karyawanData);
        
        // Format the employee data
        const formattedEmployees: Employee[] = karyawanData.map(employee => ({
          karyawan_id: employee.karyawan_id,
          name: employee.name,
          email: employee.email || "",
          role: employee.role || employee.business_role,
          auth_id: employee.auth_id,
          is_active: employee.is_active,
          pelaku_usaha_id: employee.pelaku_usaha_id,
          cabang_id: employee.cabang_id,
          cabang: employee.cabang,
          pelaku_usaha: employee.pelaku_usaha,
          isSameBusiness: employee.pelaku_usaha_id === currentPelakuUsaha.pelaku_usaha_id,
          businessName: employee.pelaku_usaha?.business_name || 'Tidak diketahui'
        }));

        // Sort employees: current business first, then by branch, then by name
        const sortedEmployees = formattedEmployees.sort((a, b) => {
          // First sort by isSameBusiness (current business first)
          if (a.isSameBusiness && !b.isSameBusiness) return -1;
          if (!a.isSameBusiness && b.isSameBusiness) return 1;
          
          // Then sort by branch within the same business
          if (a.isSameBusiness && b.isSameBusiness) {
            if (a.cabang?.branch_name && b.cabang?.branch_name) {
              return a.cabang.branch_name.localeCompare(b.cabang.branch_name);
            }
          }
          
          // Finally sort by name
          return a.name.localeCompare(b.name);
        });

        setEmployees(sortedEmployees);
      } else {
        // If no employees found in karyawan table, load from profiles
        loadEmployeesFromProfiles(currentPelakuUsaha.pelaku_usaha_id);
      }
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

  // Fallback method to load employees from profiles
  const loadEmployeesFromProfiles = async (currentPelakuUsahaId: number) => {
    try {
      console.log("Loading employees from profiles...");
      
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          role,
          business_role,
          is_employee,
          pelaku_usaha_id,
          cabang_id,
          cabang:cabang_id (
            branch_name
          ),
          pelaku_usaha:pelaku_usaha_id (
            business_name
          )
        `)
        .eq("is_employee", true)
        .order("pelaku_usaha_id", { ascending: false, nullsFirst: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Raw profiles data:", profilesData);
      
      // Format the profiles data to match Employee structure
      const formattedEmployees: Employee[] = (profilesData || []).map(profile => ({
        karyawan_id: parseInt(profile.id.replace(/-/g, "").substring(0, 8), 16), // Generate numeric ID from UUID
        name: profile.full_name,
        email: "",  // Profiles don't store email directly
        role: profile.role || profile.business_role,
        auth_id: profile.id,
        is_active: true,
        pelaku_usaha_id: profile.pelaku_usaha_id,
        cabang_id: profile.cabang_id,
        cabang: profile.cabang,
        pelaku_usaha: profile.pelaku_usaha,
        isSameBusiness: profile.pelaku_usaha_id === currentPelakuUsahaId,
        businessName: profile.pelaku_usaha?.business_name || 'Tidak diketahui'
      }));

      // Sort employees
      const sortedEmployees = formattedEmployees.sort((a, b) => {
        if (a.isSameBusiness && !b.isSameBusiness) return -1;
        if (!a.isSameBusiness && b.isSameBusiness) return 1;
        
        if (a.isSameBusiness && b.isSameBusiness) {
          if (a.cabang?.branch_name && b.cabang?.branch_name) {
            return a.cabang.branch_name.localeCompare(b.cabang.branch_name);
          }
        }
        
        return a.name.localeCompare(b.name);
      });

      console.log("Employees loaded from profiles:", sortedEmployees);
      setEmployees(sortedEmployees);
    } catch (error) {
      console.error("Error in loadEmployeesFromProfiles:", error);
      setEmployees([]);
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
