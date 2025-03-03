
import React from "react";
import { useTransferHistory } from "../hooks/useTransferHistory";
import TransferFilter from "./TransferFilter";
import TransferHistoryTable from "./TransferHistoryTable";
import TransferHistoryLoading from "./TransferHistoryLoading";
import TransferHistoryError from "./TransferHistoryError";

const TransferHistory = () => {
  const { 
    branches, 
    branchFilter, 
    setBranchFilter, 
    transfers, 
    isLoading, 
    error 
  } = useTransferHistory();

  if (isLoading) {
    return <TransferHistoryLoading />;
  }
  
  if (error) {
    console.error("Error in transfers history query:", error);
    return <TransferHistoryError error={error} />;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Riwayat Transfer</h3>
      
      <TransferFilter
        branches={branches}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
      />
      
      <TransferHistoryTable 
        transfers={transfers} 
        branchFilter={branchFilter} 
      />
    </div>
  );
};

export default TransferHistory;
