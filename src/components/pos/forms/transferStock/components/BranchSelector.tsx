
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransferStockFormValues } from "../schema";

interface BranchSelectorProps {
  form: UseFormReturn<TransferStockFormValues>;
  sourceBranches: Array<{
    cabang_id: number;
    branch_name: string;
  }>;
  destinationBranches: Array<{
    cabang_id: number;
    branch_name: string;
  }>;
}

export function BranchSelector({ 
  form, 
  sourceBranches, 
  destinationBranches 
}: BranchSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="cabang_id_from"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cabang Asal</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={sourceBranches.length === 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang asal" />
                </SelectTrigger>
                <SelectContent>
                  {sourceBranches.map((branch) => (
                    <SelectItem 
                      key={branch.cabang_id} 
                      value={branch.cabang_id.toString()}
                    >
                      {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cabang_id_to"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cabang Tujuan</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={destinationBranches.length === 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {destinationBranches.map((branch) => (
                    <SelectItem 
                      key={branch.cabang_id} 
                      value={branch.cabang_id.toString()}
                    >
                      {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
