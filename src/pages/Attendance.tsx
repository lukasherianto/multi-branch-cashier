import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Attendance = () => {
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
      
      // Get employee data
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

      // Get today's attendance
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

      // Get attendance history
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

      // Get employee data
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
        // Clock in
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
        // Clock out
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

  if (isEmployee === false) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Anda tidak terdaftar sebagai karyawan. Silakan hubungi admin untuk mendaftarkan Anda sebagai karyawan.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Absensi Karyawan</h1>

      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold">
            {format(currentTime, "HH:mm:ss")}
          </div>
          <div className="text-lg">
            {format(currentTime, "EEEE, dd MMMM yyyy", { locale: id })}
          </div>
          <Button
            onClick={handleAttendance}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {!todayAttendance ? "Absen Masuk" : "Absen Keluar"}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Riwayat Absensi</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Jam Masuk
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Jam Keluar
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceHistory.map((record) => (
                <tr key={record.absensi_id}>
                  <td className="px-4 py-2 text-sm">
                    {format(new Date(record.tanggal), "dd/MM/yyyy")}
                  </td>
                  <td className="px-4 py-2 text-sm">{record.jam_masuk}</td>
                  <td className="px-4 py-2 text-sm">
                    {record.jam_keluar || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm capitalize">{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;