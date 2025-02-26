
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const transferStockSchema = z.object({
  cabang_id_from: z.string(),
  cabang_id_to: z.string(),
  products: z.array(z.object({
    produk_id: z.number(),
    quantity: z.number().min(1, "Jumlah harus lebih dari 0"),
    selected: z.boolean()
  }))
});

type TransferStockFormValues = z.infer<typeof transferStockSchema>;

interface ProductTransfer {
  produk_id: number;
  quantity: number;
  selected: boolean;
  product_name: string;
  stock: number;
}

export function TransferStockForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<ProductTransfer[]>([]);

  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      products: []
    }
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
      
      if (data) {
        setSelectedProducts(data.map(product => ({
          produk_id: product.produk_id,
          quantity: 0,
          selected: false,
          product_name: product.product_name,
          stock: product.stock
        })));
      }
      
      return data || [];
    },
    enabled: !!pelakuUsaha,
  });

  const handleProductSelection = (produk_id: number, checked: boolean) => {
    setSelectedProducts(prev => prev.map(p => 
      p.produk_id === produk_id ? { ...p, selected: checked } : p
    ));
  };

  const handleQuantityChange = (produk_id: number, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => 
      p.produk_id === produk_id ? { ...p, quantity } : p
    ));
  };

  async function onSubmit(values: TransferStockFormValues) {
    try {
      setIsSubmitting(true);

      const productsToTransfer = selectedProducts.filter(p => p.selected && p.quantity > 0);
      
      if (productsToTransfer.length === 0) {
        toast({
          title: "Error",
          description: "Pilih minimal satu produk untuk ditransfer",
          variant: "destructive",
        });
        return;
      }

      // Validate stock for all selected products
      for (const product of productsToTransfer) {
        if (product.quantity > product.stock) {
          toast({
            title: "Error",
            description: `Stok ${product.product_name} tidak mencukupi`,
            variant: "destructive",
          });
          return;
        }
      }

      // Create transfer records for each selected product
      for (const product of productsToTransfer) {
        // Create transfer record
        const { error: transferError } = await supabase
          .from('transfer_stok')
          .insert({
            produk_id: product.produk_id,
            cabang_id_from: parseInt(values.cabang_id_from),
            cabang_id_to: parseInt(values.cabang_id_to),
            quantity: product.quantity,
          });

        if (transferError) throw transferError;

        // Update stock at source
        const { error: updateError } = await supabase
          .from('produk')
          .update({ stock: product.stock - product.quantity })
          .eq('produk_id', product.produk_id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Sukses",
        description: "Transfer stok berhasil dilakukan",
      });

      // Reset selections
      setSelectedProducts(prev => prev.map(p => ({ ...p, selected: false, quantity: 0 })));
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
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Pilih</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Stok Tersedia</TableHead>
                <TableHead className="w-48">Jumlah Transfer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedProducts.map((product) => (
                <TableRow key={product.produk_id}>
                  <TableCell>
                    <Checkbox
                      checked={product.selected}
                      onCheckedChange={(checked) => 
                        handleProductSelection(product.produk_id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={product.stock}
                      value={product.quantity}
                      onChange={(e) => 
                        handleQuantityChange(product.produk_id, parseInt(e.target.value) || 0)
                      }
                      disabled={!product.selected}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button type="submit" disabled={isSubmitting || selectedProducts.filter(p => p.selected).length === 0}>
          {isSubmitting ? "Memproses..." : "Transfer Stok"}
        </Button>
      </form>
    </Form>
  );
}
