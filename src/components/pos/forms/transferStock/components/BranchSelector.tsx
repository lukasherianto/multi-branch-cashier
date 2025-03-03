
import React, { useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TransferStockFormValues } from "../schema";

interface BranchSelectorProps {
  form: UseFormReturn<TransferStockFormValues>;
  sourceBranches: Array<{ cabang_id: number; branch_name: string }>;
  destinationBranches: Array<{ cabang_id: number; branch_name: string }>;
}

export const BranchSelector = ({ 
  form, 
  sourceBranches, 
  destinationBranches 
}: BranchSelectorProps) => {
  // Auto-select first source branch if only one is available
  useEffect(() => {
    if (sourceBranches.length === 1 && !form.getValues().cabang_id_from) {
      const sourceBranchId = sourceBranches[0].cabang_id.toString();
      form.setValue("cabang_id_from", sourceBranchId);
      console.log("Auto-selected source branch:", sourceBranchId);
    }
  }, [sourceBranches, form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="cabang_id_from"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dari Cabang</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                console.log("Selected source branch:", value);
              }} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang asal" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sourceBranches.map((branch) => (
                  <SelectItem key={branch.cabang_id} value={branch.cabang_id.toString()}>
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cabang_id_to"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ke Cabang</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang tujuan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {destinationBranches.map((branch) => (
                  <SelectItem key={branch.cabang_id} value={branch.cabang_id.toString()}>
                    {branch.branch_name}
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
