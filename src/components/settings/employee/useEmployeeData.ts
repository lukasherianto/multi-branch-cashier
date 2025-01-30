import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Branch, Employee } from "./types";

export const useEmployeeData = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const loadBranches = async () => {
    try {
      console.log("Loading branches...");
      const { data: { user } } = await supabase.auth.getUser();
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
      console.log("Loading employees...");
      const { data: { user } } = await supabase.auth.getUser();
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

      const { data: employeesData, error } = await supabase
        .from("karyawan")
        .select("*, cabang(branch_name)")
        .eq("pelaku_usaha_id", pelakuUsaha.pelaku_usaha_id);

      if (error) throw error;
      console.log("Employees loaded:", employeesData);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data karyawan",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadBranches();
    loadEmployees();
  }, []);

  return {
    isLoading,
    setIsLoading,
    employees,
    branches,
    loadEmployees,
  };
};