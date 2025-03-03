
import React from "react";
import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransferFilterProps {
  branches: Array<{ cabang_id: number; branch_name: string }>;
  branchFilter: string;
  setBranchFilter: (value: string) => void;
}

const TransferFilter = ({ branches, branchFilter, setBranchFilter }: TransferFilterProps) => {
  return (
    <div className="flex items-center justify-end mb-4 gap-2">
      <Filter className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-700">Filter cabang:</span>
      <Select 
        value={branchFilter} 
        onValueChange={setBranchFilter}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pilih cabang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Cabang</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.cabang_id} value={branch.branch_name}>
              {branch.branch_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TransferFilter;
