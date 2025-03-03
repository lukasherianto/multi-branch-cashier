
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransferHistory } from "../hooks/useTransferHistory";
import { useBranches } from "../hooks/useBranches";
import TransferHistoryTable from "./TransferHistoryTable";
import TransferHistoryLoading from "./TransferHistoryLoading";
import TransferHistoryError from "./TransferHistoryError";

const TransferHistory = () => {
  const { transfers, isLoading, error, handleBranchChange, refreshHistory } = useTransferHistory();
  const { branches, branchesLoading } = useBranches();
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("all");

  const handleBranchFilter = (value: string) => {
    setSelectedBranchFilter(value);
    handleBranchChange(value === "all" ? null : parseInt(value));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg">Riwayat Transfer</CardTitle>
        
        <div className="flex">
          <Select
            value={selectedBranchFilter}
            onValueChange={handleBranchFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter Cabang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Cabang</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.cabang_id} value={branch.cabang_id.toString()}>
                  {branch.branch_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <TransferHistoryLoading />
        ) : error ? (
          <TransferHistoryError error={error} onRetry={refreshHistory} />
        ) : (
          <TransferHistoryTable transfers={transfers} />
        )}
      </CardContent>
    </Card>
  );
};

export default TransferHistory;
