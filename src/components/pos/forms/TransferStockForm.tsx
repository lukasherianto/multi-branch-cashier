
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const transferStockSchema = z.object({
  produk_id: z.string(),
  cabang_id_from: z.string(),
  cabang_id_to: z.string(),
  quantity: z.string().transform(val => parseInt(val, 10)),
});

type TransferStockFormValues = z.infer<typeof transferStockSchema>;

export function TransferStockForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
  });

  // Fetch pelaku usaha first
  const { data: pelakuUsaha } = useQuery({
    queryKey: ['pelakuUsaha', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['branches', pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return [];
      const { data } = await supabase
        .from('cabang')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);
      return data || [];
    },
    enabled: !!pelakuUsaha,
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products', pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return [];
      const { data } = await supabase
        .from('produk')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);
      return data || [];
    },
    enabled: !!pelakuUsaha,
  });

  async function onSubmit(values: TransferStockFormValues) {
    try {
      setIsSubmitting(true);

      // Check if product has enough stock
      const product = products.find(p => p.produk_id.toString() === values.produk_id);
      if (!product || product.stock < values.quantity) {
        toast({
          title: "Error",
          description: "Stok produk tidak mencukupi",
          variant: "destructive",
        });
        return;
      }

      // Create transfer record
      const { error: transferError } = await supabase
        .from('transfer_stok')
        .insert({
          produk_id: parseInt(values.produk_id, 10),
          cabang_id_from: parseInt(values.cabang_id_from, 10),
          cabang_id_to: parseInt(values.cabang_id_to, 10),
          quantity: values.quantity,
        });

      if (transferError) throw transferError;

      // Update stock at source
      const { error: updateError } = await supabase
        .from('produk')
        .update({ stock: product.stock - values.quantity })
        .eq('produk_id', parseInt(values.produk_id, 10));

      if (updateError) throw updateError;

      toast({
        title: "Sukses",
        description: "Transfer stok berhasil dilakukan",
      });

      form.reset();
    } catch (error) {
      console.error('Error transferring stock:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan transfer stok",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="produk_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produk</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.produk_id} value={product.produk_id.toString()}>
                      {product.product_name} (Stok: {product.stock})
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
          name="cabang_id_from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dari Cabang</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cabang asal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {branches.map((branch) => (
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cabang tujuan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {branches.map((branch) => (
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : "Transfer Stok"}
        </Button>
      </form>
    </Form>
  );
}
