
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "./schema";

interface PricingFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

export function PricingFields({ form }: PricingFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cost_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Harga Modal</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="retail_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Harga Jual Umum</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="member_price_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga Member 1</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="member_price_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga Member 2</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
