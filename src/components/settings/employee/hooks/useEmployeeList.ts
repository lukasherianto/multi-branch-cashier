
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchEmployees, mapEmployeeData } from "../api/employeeApi";
import { Employee } from "../types";

export const useEmployeeList = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadEmployees = async (pelakuUsahaId: number) => {
    try {
      setIsLoading(true);
      console.log("Loading employees for pelakuUsahaId:", pelakuUsahaId);
      const employeesData = await fetchEmployees(pelakuUsahaId);
      
      console.log("Raw employees data received from profiles:", employeesData);
      
      if (!employeesData || employeesData.length === 0) {
        console.log("No employee data returned from the profiles table");
        setEmployees([]);
        return [];
      }
      
      const formattedEmployees = mapEmployeeData(employeesData, pelakuUsahaId);
      
      console.log("Formatted employees:", formattedEmployees);
      setEmployees(formattedEmployees);
      return formattedEmployees;
    } catch (err: any) {
      console.error("Error loading employees:", err);
      setError(err.message || "Gagal memuat data karyawan");
      toast({
        title: "Error",
        description: "Gagal memuat data karyawan",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    employees,
    setEmployees,
    loadEmployees,
    isLoading,
    error
  };
};
