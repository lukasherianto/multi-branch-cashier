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
      const { data: pelakuUsaha } = await supabase
        .from("pelaku_usaha")
        .select("pelaku_usaha_id")
        .single();

      if (!pelakuUsaha) {
        console.error("No pelaku usaha found");
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
      const { data: pelakuUsaha } = await supabase
        .from("pelaku_usaha")
        .select("pelaku_usaha_id")
        .single();

      if (!pelakuUsaha) {
        console.error("No pelaku usaha found");
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