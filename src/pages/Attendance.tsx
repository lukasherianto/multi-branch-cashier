import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
import { useAttendance } from "@/hooks/useAttendance";

const Attendance = () => {
  const {
    currentTime,
    attendanceHistory,
    todayAttendance,
    isLoading,
    isEmployee,
    handleAttendance,
  } = useAttendance();

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