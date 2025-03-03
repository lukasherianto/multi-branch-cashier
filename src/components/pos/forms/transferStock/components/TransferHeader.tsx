
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const TransferHeader = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Transfer Stok</h2>
        <p className="text-gray-600 mt-2">Transfer stok dari pusat ke cabang</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>
          Produk hanya dapat diinput di pusat. Cabang hanya dapat menerima produk melalui transfer stok dari pusat.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TransferHeader;
