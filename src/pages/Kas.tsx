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

const formSchema = z.object({
  amount: z.string().min(1, "Jumlah harus diisi"),
  description: z.string().optional(),
});

const Kas = () => {
  const { toast } = useToast();

  const cashInForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
    },
  });

  const cashOutForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
    },
  });

  const onCashInSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase.from("kas").insert({
        amount: parseFloat(values.amount),
        transaction_type: "masuk",
        description: values.description || null,
        cabang_id: 1, // You should replace this with the actual branch ID
      });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Uang masuk berhasil dicatat",
      });

      cashInForm.reset();
    } catch (error) {
      console.error("Error recording cash in:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat uang masuk",
        variant: "destructive",
      });
    }
  };

  const onCashOutSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase.from("kas").insert({
        amount: parseFloat(values.amount),
        transaction_type: "keluar",
        description: values.description || null,
        cabang_id: 1, // You should replace this with the actual branch ID
      });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Uang keluar berhasil dicatat",
      });

      cashOutForm.reset();
    } catch (error) {
      console.error("Error recording cash out:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat uang keluar",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-8 h-8 text-mint-600" />
        <h1 className="text-2xl font-semibold">Kas</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-medium">Uang Masuk</h2>
          <Form {...cashInForm}>
            <form onSubmit={cashInForm.handleSubmit(onCashInSubmit)} className="space-y-4">
              <FormField
                control={cashInForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
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
                    <FormLabel>Keterangan</FormLabel>
                    <FormControl>
                      <Input placeholder="Keterangan uang masuk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Simpan Uang Masuk
              </Button>
            </form>
          </Form>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-medium">Uang Keluar</h2>
          <Form {...cashOutForm}>
            <form onSubmit={cashOutForm.handleSubmit(onCashOutSubmit)} className="space-y-4">
              <FormField
                control={cashOutForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
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
                    <FormLabel>Keterangan</FormLabel>
                    <FormControl>
                      <Input placeholder="Keterangan uang keluar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
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