import React from "react";
import { format } from "date-fns";

interface AttendanceHistoryProps {
  attendanceHistory: any[];
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ 
  attendanceHistory 
}) => {
  return (
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
  );
};