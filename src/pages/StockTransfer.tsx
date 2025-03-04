
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransferStockForm } from "@/components/pos/forms/transferStock";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const StockTransfer = () => {
  const [renderError, setRenderError] = useState<Error | null>(null);
  
  // If we caught a render error, show it
  if (renderError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            An error occurred while rendering the page. Please try refreshing.
            {renderError instanceof Error && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {renderError.message}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  try {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Stok Antar Cabang</CardTitle>
          </CardHeader>
          <CardContent>
            <TransferStockForm />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Uncaught error rendering StockTransfer:", error);
    // Update state with the error so we can show the error boundary on next render
    setRenderError(error instanceof Error ? error : new Error(String(error)));
    
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
              </pre>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
};

export default StockTransfer;
