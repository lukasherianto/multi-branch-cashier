
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { TransferToBranchValues } from '@/types/pos';

export interface BranchSelectorProps {
  form: UseFormReturn<TransferToBranchValues>;
  branchOptions: { value: string; label: string }[];
  loading: boolean;
}

const BranchSelector = ({ form, branchOptions, loading }: BranchSelectorProps) => {
  if (loading) {
    return (
      <div className="p-2 rounded-md bg-gray-50 text-center">
        <span className="animate-pulse">Loading branches...</span>
      </div>
    );
  }

  return (
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
              disabled={loading || branchOptions.length === 0}
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
