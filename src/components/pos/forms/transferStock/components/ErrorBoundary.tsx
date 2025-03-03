
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error;
}

const ErrorBoundary = ({ error }: ErrorBoundaryProps) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p>Terjadi kesalahan saat merender komponen:</p>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {error.message}
          {error.stack}
        </pre>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorBoundary;
