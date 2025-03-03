
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface TransferHistoryErrorProps {
  error: unknown;
}

const TransferHistoryError = ({ error }: TransferHistoryErrorProps) => {
  return (
    <div className="p-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Gagal memuat data riwayat transfer stok. Silakan coba lagi nanti.
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TransferHistoryError;
