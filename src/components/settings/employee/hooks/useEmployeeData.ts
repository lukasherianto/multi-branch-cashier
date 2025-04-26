
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "../types";
import { useAuth } from "@/hooks/auth";
import { fetchEmployeesFromKaryawan, fetchEmployeesFromProfiles } from "../utils/fetchEmployees";
import { useBranchData } from "./useBranchData";

export const useEmployeeData = () => {
  const { toast } = useToast();
  const { user, pelakuUsaha } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { branches, loadBranches } = useBranchData();

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      console.log("Loading employees...");
      
      if (!user) {
        console.error("No authenticated user");
        return;
      }

      const currentBusinessId = pelakuUsaha?.pelaku_usaha_id 
        ? (typeof pelakuUsaha.pelaku_usaha_id === 'string' 
          ? parseInt(pelakuUsaha.pelaku_usaha_id, 10) 
          : pelakuUsaha.pelaku_usaha_id)
        : null;

      if (!currentBusinessId) {
        console.error("Cannot determine current business ID");
        return;
      }

      console.log("Current business ID:", currentBusinessId);

      // Try to get employees from karyawan table first
      const karyawanEmployees = await fetchEmployeesFromKaryawan(currentBusinessId);
      
      // If no employees in karyawan table, try profiles table
      const employeeData = karyawanEmployees || await fetchEmployeesFromProfiles(currentBusinessId);

      // Sort employees
      const sortedEmployees = employeeData.sort((a, b) => {
        if (a.isSameBusiness && !b.isSameBusiness) return -1;
        if (!a.isSameBusiness && b.isSameBusiness) return 1;
        if (a.isSameBusiness && b.isSameBusiness) {
          if (a.cabang?.branch_name && b.cabang?.branch_name) {
            return a.cabang.branch_name.localeCompare(b.cabang.branch_name);
          }
        }
        return a.name.localeCompare(b.name);
      });

      setEmployees(sortedEmployees);
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
      loadEmployees();
    }
  }, [user, pelakuUsaha]);

  return {
    isLoading,
    employees,
    branches,
    loadEmployees,
  };
};
