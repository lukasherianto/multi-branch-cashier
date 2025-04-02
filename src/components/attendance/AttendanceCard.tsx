
import React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AttendanceCardProps {
  currentTime: Date;
  todayAttendance: any;
  isLoading: boolean;
  onAttendance: (status: string, keterangan?: string) => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  currentTime,
  todayAttendance,
  isLoading,
  onAttendance,
}) => {
  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="text-4xl font-bold">
          {format(currentTime, "HH:mm:ss")}
        </div>
        <div className="text-lg">
          {format(currentTime, "EEEE, dd MMMM yyyy", { locale: id })}
        </div>
        <Button
          onClick={() => onAttendance(todayAttendance ? "keluar" : "masuk")}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {!todayAttendance ? "Absen Masuk" : "Absen Keluar"}
        </Button>
      </div>
    </Card>
  );
};
