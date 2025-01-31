import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useAttendance = () => {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    loadAttendanceData();

    return () => clearInterval(timer);
  }, []);

  const loadAttendanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Loading employee data for user:", user.id);
      
      const { data: employeeData, error: employeeError } = await supabase
        .from("karyawan")
        .select("karyawan_id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (employeeError) {
        console.error("Error fetching employee data:", employeeError);
        throw employeeError;
      }

      if (!employeeData) {
        console.log("No employee data found for user");
        setIsEmployee(false);
        return;
      }

      setIsEmployee(true);
      console.log("Employee data found:", employeeData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayData, error: todayError } = await supabase
        .from("absensi")
        .select("*")
        .eq("karyawan_id", employeeData.karyawan_id)
        .eq("tanggal", format(today, "yyyy-MM-dd"))
        .maybeSingle();

      if (todayError) {
        console.error("Error fetching today's attendance:", todayError);
        throw todayError;
      }

      setTodayAttendance(todayData);
      console.log("Today's attendance:", todayData);

      const { data: historyData, error: historyError } = await supabase
        .from("absensi")
        .select("*")
        .eq("karyawan_id", employeeData.karyawan_id)
        .order("tanggal", { ascending: false })
        .limit(10);

      if (historyError) {
        console.error("Error fetching attendance history:", historyError);
        throw historyError;
      }

      setAttendanceHistory(historyData || []);
      console.log("Attendance history loaded:", historyData);

    } catch (error) {
      console.error("Error loading attendance data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data absensi",
        variant: "destructive",
      });
    }
  };

  const handleAttendance = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employeeData, error: employeeError } = await supabase
        .from("karyawan")
        .select("karyawan_id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (employeeError) throw employeeError;

      if (!employeeData) {
        toast({
          title: "Error",
          description: "Data karyawan tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      const currentHour = currentTime.getHours();
      let status = "hadir";

      if (!todayAttendance) {
        const { error } = await supabase
          .from("absensi")
          .insert([
            {
              karyawan_id: employeeData.karyawan_id,
              tanggal: format(currentTime, "yyyy-MM-dd"),
              jam_masuk: format(currentTime, "HH:mm:ss"),
              status,
            },
          ]);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Berhasil melakukan absen masuk",
        });
      } else {
        const { error } = await supabase
          .from("absensi")
          .update({
            jam_keluar: format(currentTime, "HH:mm:ss"),
          })
          .eq("absensi_id", todayAttendance.absensi_id);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Berhasil melakukan absen keluar",
        });
      }

      await loadAttendanceData();
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error",
        description: "Gagal melakukan absensi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentTime,
    attendanceHistory,
    todayAttendance,
    isLoading,
    isEmployee,
    handleAttendance,
  };
};