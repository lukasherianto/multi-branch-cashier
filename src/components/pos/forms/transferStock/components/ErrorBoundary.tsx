
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error | null;
}

const ErrorBoundary = ({ error }: ErrorBoundaryProps) => {
  if (!error) return null;

  return (
    <div className="p-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Rendering Error</AlertTitle>
        <AlertDescription>
          {error.message}
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {error.stack}
          </pre>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorBoundary;
