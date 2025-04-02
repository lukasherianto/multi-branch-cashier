
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

      // Fetch from profiles table instead of karyawan table
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
        .eq("is_employee", true);

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
        isSameBusiness: profile.pelaku_usaha_id === currentPelakuUsaha.pelaku_usaha_id,
        businessName: profile.pelaku_usaha?.business_name || 'Tidak diketahui'
      }));

      console.log("Employees loaded from profiles:", formattedEmployees);
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
