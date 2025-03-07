
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
      
      // Check if user is an employee from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_employee")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        throw profileError;
      }

      if (!profileData || !profileData.is_employee) {
        console.log("User is not an employee");
        setIsEmployee(false);
        return;
      }

      setIsEmployee(true);
      console.log("Employee data found:", profileData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Note: This will not work correctly because absensi uses karyawan_id
      // To fix this properly, we'd need to modify the absensi table to use auth.id
      const { data: todayData, error: todayError } = await supabase
        .from("absensi")
        .select("*")
        .eq("tanggal", format(today, "yyyy-MM-dd"))
        .maybeSingle();

      if (todayError) {
        console.error("Error fetching today's attendance:", todayError);
        throw todayError;
      }

      setTodayAttendance(todayData);
      console.log("Today's attendance:", todayData);

      // Similarly, this won't work correctly without updating the absensi table
      const { data: historyData, error: historyError } = await supabase
        .from("absensi")
        .select("*")
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

      // Note: This functionality is broken after removing karyawan table
      // To fix, we would need to update the absensi table to use auth.id instead of karyawan_id
      toast({
        title: "Error",
        description: "Sistem absensi sedang dalam perbaikan",
        variant: "destructive",
      });
      
      return;

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
