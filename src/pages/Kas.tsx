
import { DollarSign } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

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
import { useEffect } from "react";

const formSchema = z.object({
  amount: z.string().min(1, "Jumlah harus diisi"),
  description: z.string().optional(),
  transaction_date: z.string().min(1, "Tanggal harus diisi"),
});

const Kas = () => {
  const { toast } = useToast();
  const { selectedBranchId } = useAuth();

  const cashInForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  const cashOutForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (!selectedBranchId) {
      toast({
        title: "Perhatian",
        description: "Silakan pilih cabang terlebih dahulu",
        variant: "destructive",
      });
    }
  }, [selectedBranchId, toast]);

  const onCashInSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedBranchId) {
      toast({
        title: "Error",
        description: "Silakan pilih cabang terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Submitting cash in:", values);
      
      const { error } = await supabase.from("kas").insert({
        amount: parseFloat(values.amount),
        transaction_type: "masuk",
        description: values.description || null,
        transaction_date: new Date(values.transaction_date).toISOString(),
        cabang_id: selectedBranchId,
      });

      if (error) {
        console.error("Error recording cash in:", error);
        throw error;
      }

      toast({
        title: "Sukses",
        description: "Uang masuk berhasil dicatat",
      });

      cashInForm.reset({
        amount: "",
        description: "",
        transaction_date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error recording cash in:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat uang masuk: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    }
  };

  const onCashOutSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedBranchId) {
      toast({
        title: "Error",
        description: "Silakan pilih cabang terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Submitting cash out:", values);
      
      const { error } = await supabase.from("kas").insert({
        amount: parseFloat(values.amount),
        transaction_type: "keluar",
        description: values.description || null,
        transaction_date: new Date(values.transaction_date).toISOString(),
        cabang_id: selectedBranchId,
      });

      if (error) {
        console.error("Error recording cash out:", error);
        throw error;
      }

      toast({
        title: "Sukses",
        description: "Uang keluar berhasil dicatat",
      });

      cashOutForm.reset({
        amount: "",
        description: "",
        transaction_date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error recording cash out:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat uang keluar: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-6 h-6 text-mint-600" />
        <h1 className="text-xl font-semibold">Kas</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="mb-3 text-base font-medium">Uang Masuk</h2>
          <Form {...cashInForm}>
            <form onSubmit={cashInForm.handleSubmit(onCashInSubmit)} className="space-y-3">
              <FormField
                control={cashInForm.control}
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
                control={cashInForm.control}
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
                control={cashInForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Keterangan</FormLabel>
                    <FormControl>
                      <Input placeholder="Keterangan uang masuk" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-9">
                Simpan Uang Masuk
              </Button>
            </form>
          </Form>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="mb-3 text-base font-medium">Uang Keluar</h2>
          <Form {...cashOutForm}>
            <form onSubmit={cashOutForm.handleSubmit(onCashOutSubmit)} className="space-y-3">
              <FormField
                control={cashOutForm.control}
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
                control={cashOutForm.control}
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
                control={cashOutForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Keterangan</FormLabel>
                    <FormControl>
                      <Input placeholder="Keterangan uang keluar" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-9">
                Simpan Uang Keluar
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Kas;
