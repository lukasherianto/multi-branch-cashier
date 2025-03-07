
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TransferStockFormValues } from "@/types/pos";

interface BranchSelectorProps {
  form: UseFormReturn<TransferStockFormValues>;
  sourceBranches: Array<{
    cabang_id: number;
    branch_name: string;
    status?: number; // Added status property
  }>;
  destinationBranches: Array<{
    cabang_id: number;
    branch_name: string;
    status?: number; // Added status property
  }>;
}

export const BranchSelector = ({ 
  form, 
  sourceBranches, 
  destinationBranches 
}: BranchSelectorProps) => {
  // Helper function to determine if a branch is the headquarters
  const isHeadquarters = (branchName: string, status?: number) => {
    // Exclude "Cabang Pasar Ujung" from being labeled as headquarters
    if (branchName.includes("Pasar Ujung")) {
      return false;
    }
    return status === 1;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <FormField
          control={form.control}
          name="cabang_id_from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cabang Asal</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Cabang Asal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sourceBranches.map((branch) => (
                    <SelectItem
                      key={branch.cabang_id}
                      value={branch.cabang_id.toString()}
                    >
                      {branch.branch_name}{isHeadquarters(branch.branch_name, branch.status) ? " (Pusat)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="flex-1">
        <FormField
          control={form.control}
          name="cabang_id_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cabang Tujuan</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Cabang Tujuan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {destinationBranches.map((branch) => (
                    <SelectItem
                      key={branch.cabang_id}
                      value={branch.cabang_id.toString()}
                    >
                      {branch.branch_name}{isHeadquarters(branch.branch_name, branch.status) ? " (Pusat)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
