
import { DollarSign } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Form schema can be reused for both cash in and cash out
export const cashFormSchema = z.object({
  amount: z.string().min(1, "Jumlah harus diisi"),
  description: z.string().optional(),
  transaction_date: z.string().min(1, "Tanggal harus diisi"),
});

export type CashFormValues = z.infer<typeof cashFormSchema>;

interface CashFormProps {
  type: "masuk" | "keluar";
  onSubmit: (values: CashFormValues) => Promise<void>;
}

export const CashForm = ({ type, onSubmit }: CashFormProps) => {
  const form = useForm<CashFormValues>({
    resolver: zodResolver(cashFormSchema),
    defaultValues: {
      amount: "",
      description: "",
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  const title = type === "masuk" ? "Uang Masuk" : "Uang Keluar";
  const placeholderText = type === "masuk" 
    ? "Keterangan uang masuk" 
    : "Keterangan uang keluar";
  const buttonText = type === "masuk" 
    ? "Simpan Uang Masuk" 
    : "Simpan Uang Keluar";

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="mb-3 text-base font-medium">{title}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="transaction_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Tanggal</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Jumlah (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Keterangan</FormLabel>
                <FormControl>
                  <Input placeholder={placeholderText} {...field} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-9">
            {buttonText}
          </Button>
        </form>
      </Form>
    </div>
  );
};
