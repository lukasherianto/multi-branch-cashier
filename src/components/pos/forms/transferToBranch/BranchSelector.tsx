
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type UseFormReturn } from "react-hook-form";
import { type TransferToBranchFormValues } from "./schema";

interface BranchSelectorProps {
  form: UseFormReturn<TransferToBranchFormValues>;
  destinationBranches: Array<{ cabang_id: number; branch_name: string }>;
}

export function BranchSelector({ form, destinationBranches }: BranchSelectorProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="cabang_id_to"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cabang Tujuan</FormLabel>
            <FormControl>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {destinationBranches.map(branch => (
                    <SelectItem key={branch.cabang_id} value={branch.cabang_id.toString()}>
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
