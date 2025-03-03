
import React, { useState } from "react";
import { TransferToBranchForm } from "@/components/pos/forms/transferToBranch";
import TransferHeader from "@/components/pos/forms/transferStock/components/TransferHeader";
import TransferHistory from "@/components/pos/forms/transferStock/components/TransferHistory";
import ErrorBoundary from "@/components/pos/forms/transferStock/components/ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const TransferToBranch = () => {
  const [renderError, setRenderError] = useState<Error | null>(null);
  
  // If we caught a render error, show it
  if (renderError) {
    return <ErrorBoundary error={renderError} />;
  }

  try {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Transfer Produk Ke Cabang</h2>
        <p className="text-gray-600">Transfer produk dari pusat ke cabang-cabang tertentu.</p>
        <TransferToBranchForm />
        <TransferHistory />
      </div>
    );
  } catch (error) {
    console.error("Uncaught error rendering TransferToBranch:", error);
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Tak Terduga</AlertTitle>
          <AlertDescription>
            Terjadi kesalahan saat merender halaman. Silakan coba muat ulang halaman.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
};

export default TransferToBranch;
