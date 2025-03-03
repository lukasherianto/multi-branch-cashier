
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TransferToBranchFormValues } from "./schema";

interface BranchSelectorProps {
  form: UseFormReturn<TransferToBranchFormValues>;
  destinationBranches: Array<{
    cabang_id: number;
    branch_name: string;
  }>;
}

export function BranchSelector({ form, destinationBranches }: BranchSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="cabang_id_to"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cabang Tujuan</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
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
                  {branch.branch_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
