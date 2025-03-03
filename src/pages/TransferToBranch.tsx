
import React from "react";
import { TransferToBranchForm } from "@/components/pos/forms/transferToBranch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TransferToBranch = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Transfer Stok dari Pusat ke Cabang</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Transfer Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <TransferToBranchForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferToBranch;
