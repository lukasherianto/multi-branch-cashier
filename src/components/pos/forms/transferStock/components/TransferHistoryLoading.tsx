
import React from "react";

const TransferHistoryLoading = () => {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-lg">Memuat data riwayat transfer stok...</p>
    </div>
  );
};

export default TransferHistoryLoading;
