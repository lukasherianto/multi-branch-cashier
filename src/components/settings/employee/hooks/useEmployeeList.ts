
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchEmployees, mapEmployeeData } from "../api/employeeApi";
import { Employee } from "../types";

export const useEmployeeList = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async (pelakuUsahaId: number) => {
    try {
      console.log("Loading employees...");
      const employeesData = await fetchEmployees(pelakuUsahaId);
      const formattedEmployees = mapEmployeeData(employeesData, pelakuUsahaId);
      
      console.log("Employees loaded:", formattedEmployees);
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
    }
  };

  return {
    employees,
    setEmployees,
    loadEmployees,
    error
  };
};
