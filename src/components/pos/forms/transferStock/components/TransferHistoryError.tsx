
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface TransferHistoryErrorProps {
  error: Error;
  onRetry: () => void;
}

const TransferHistoryError = ({ error, onRetry }: TransferHistoryErrorProps) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p className="mb-2">Gagal memuat riwayat transfer: {error.message}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default TransferHistoryError;
