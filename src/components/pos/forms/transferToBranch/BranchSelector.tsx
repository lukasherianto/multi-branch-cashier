
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { TransferToBranchValues } from './schema';

export interface BranchSelectorProps {
  form: UseFormReturn<TransferToBranchValues, any>;
  branchOptions: { value: string; label: string }[];
  loading: boolean;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({ form, branchOptions, loading }) => {
  return (
    <FormField
      control={form.control}
      name="cabang_id_to"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cabang Tujuan</FormLabel>
          <FormControl>
            <Select
              disabled={loading}
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih cabang tujuan" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((branch) => (
                  <SelectItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default BranchSelector;
