
import React from "react";
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="cabang_id_from"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dari Cabang</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
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
