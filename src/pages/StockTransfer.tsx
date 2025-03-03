
import React, { useState, useEffect } from "react";
import { TransferStockForm } from "@/components/pos/forms/transferStock";
import TransferHeader from "@/components/pos/forms/transferStock/components/TransferHeader";
import TransferHistory from "@/components/pos/forms/transferStock/components/TransferHistory";
import ErrorBoundary from "@/components/pos/forms/transferStock/components/ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const StockTransfer = () => {
  const [renderError, setRenderError] = useState<Error | null>(null);
  
  // Add error boundary to catch any rendering errors
  useEffect(() => {
    try {
      console.log("StockTransfer component mounted");
    } catch (err) {
      console.error("Error in StockTransfer mount:", err);
      setRenderError(err as Error);
    }
  }, []);

  // If we caught a render error, show it
  if (renderError) {
    return <ErrorBoundary error={renderError} />;
  }

  try {
    return (
      <div className="space-y-8">
        <TransferHeader />
        <TransferStockForm />
        <TransferHistory />
      </div>
    );
  } catch (error) {
    console.error("Uncaught error rendering StockTransfer:", error);
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Tak Terduga</AlertTitle>
          <AlertDescription>
            Terjadi kesalahan saat merender halaman. Silakan coba muat ulang halaman.
            {error instanceof Error && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
};

export default StockTransfer;
