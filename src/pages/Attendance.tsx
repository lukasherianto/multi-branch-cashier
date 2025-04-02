
import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
import { useAttendance } from "@/hooks/useAttendance";
import { useAuth } from "@/hooks/auth";

const Attendance = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const {
    employeeData,
    attendanceData: attendanceHistory,
    todayAttendance,
    isLoading,
    recordAttendance,
    clockOut
  } = useAttendance();
  
  const { isEmployee } = useAuth();
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const handleAttendance = (status: string, keterangan?: string) => {
    // Make sure we're only handling attendance for the current user
    if (employeeData.length > 0) {
      recordAttendance(employeeData[0].karyawan_id, status, keterangan);
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

      <AttendanceCard
        currentTime={currentTime}
        todayAttendance={todayAttendance}
        isLoading={isLoading}
        onAttendance={handleAttendance}
      />

      <AttendanceHistory attendanceHistory={attendanceHistory} />
    </div>
  );
};

export default Attendance;
