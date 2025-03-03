
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TransferToBranchValues } from "@/types/pos";

interface BranchSelectorProps {
  form: UseFormReturn<TransferToBranchValues>;
  branchOptions: Array<{
    value: string;
    label: string;
  }>;
  loading: boolean;
}

export const BranchSelector = ({ 
  form, 
  branchOptions,
  loading
}: BranchSelectorProps) => {
  return (
    <div className="w-full">
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
              disabled={loading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Memuat cabang..." : "Pilih Cabang Tujuan"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {branchOptions.map((branch) => (
                  <SelectItem
                    key={branch.value}
                    value={branch.value}
                  >
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
