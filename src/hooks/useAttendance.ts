
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuth } from "./auth";

export const useAttendance = () => {
  const { toast } = useToast();
  const { user, cabang, selectedCabangId } = useAuth();
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const fetchEmployees = async () => {
    try {
      if (!selectedCabangId) return;

      const { data, error } = await supabase
        .from("karyawan" as any)
        .select("*")
        .eq("cabang_id", selectedCabangId)
        .eq("is_active", true);

      if (error) {
        throw error;
      }

      setEmployeeData(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data karyawan",
        variant: "destructive",
      });
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      if (!selectedCabangId) return;

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("absensi")
        .select("*")
        .eq("tanggal", today);

      if (error) {
        throw error;
      }

      setTodayAttendance(data || []);

      // Map attendance data to employees
      const employeesWithAttendance = employeeData.map((employee) => {
        const attendance = data?.find(
          (a) => a.karyawan_id === employee.karyawan_id
        );
        return {
          ...employee,
          attendance: attendance || null,
        };
      });

      setEmployeeData(employeesWithAttendance);
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data kehadiran hari ini",
        variant: "destructive",
      });
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setIsLoading(true);
      if (!selectedCabangId) return;

      // Get employees from the selected branch first
      const { data: employees, error: employeeError } = await supabase
        .from("karyawan" as any)
        .select("karyawan_id, name")
        .eq("cabang_id", selectedCabangId)
        .eq("is_active", true);

      if (employeeError) {
        throw employeeError;
      }

      if (!employees || employees.length === 0) {
        setAttendanceData([]);
        return;
      }

      // Get all employee IDs
      const employeeIds = employees.map((emp) => emp.karyawan_id);

      // Get attendance data for these employees
      const { data, error } = await supabase
        .from("absensi")
        .select("*")
        .in("karyawan_id", employeeIds)
        .order("tanggal", { ascending: false });

      if (error) {
        throw error;
      }

      // Combine employee data with attendance data
      const processedData = data?.map((attendance) => {
        const employee = employees.find(
          (emp) => emp.karyawan_id === attendance.karyawan_id
        );
        return {
          ...attendance,
          name: employee?.name || "Unknown",
        };
      });

      setAttendanceData(processedData || []);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      toast({
        title: "Error",
        description: "Gagal memuat riwayat kehadiran",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recordAttendance = async (
    employeeId: number,
    status: string,
    keterangan?: string
  ) => {
    try {
      setIsLoading(true);

      // Check if employee already has attendance record for today
      const today = new Date().toISOString().split("T")[0];
      const { data: existingRecord, error: checkError } = await supabase
        .from("absensi")
        .select("*")
        .eq("karyawan_id", employeeId)
        .eq("tanggal", today)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingRecord) {
        toast({
          title: "Info",
          description: "Kehadiran karyawan ini sudah direkam hari ini",
        });
        return;
      }

      // Record new attendance
      const { data, error } = await supabase.from("absensi").insert([
        {
          karyawan_id: employeeId,
          status,
          keterangan,
        },
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Sukses",
        description: "Kehadiran berhasil dicatat",
      });

      // Refresh data
      fetchTodayAttendance();
      fetchAttendanceHistory();
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat kehadiran",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clockOut = async (absensiId: number) => {
    try {
      setIsLoading(true);

      // Get current time
      const now = new Date();
      const timeString = now.toTimeString().split(" ")[0]; // Format: HH:MM:SS

      // Update attendance record with clock out time
      const { data, error } = await supabase
        .from("absensi")
        .update({ jam_keluar: timeString })
        .eq("absensi_id", absensiId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sukses",
        description: "Jam keluar berhasil dicatat",
      });

      // Refresh data
      fetchTodayAttendance();
      fetchAttendanceHistory();
    } catch (error) {
      console.error("Error recording clock out:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat jam keluar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCabangId) {
      fetchEmployees();
      fetchAttendanceHistory();
    }
  }, [selectedCabangId]);

  useEffect(() => {
    if (employeeData.length > 0) {
      fetchTodayAttendance();
    }
  }, [employeeData]);

  return {
    employeeData,
    attendanceData,
    todayAttendance,
    isLoading,
    selectedEmployee,
    setSelectedEmployee,
    recordAttendance,
    clockOut,
    fetchEmployees,
    fetchTodayAttendance,
    fetchAttendanceHistory,
  };
};

export default useAttendance;
