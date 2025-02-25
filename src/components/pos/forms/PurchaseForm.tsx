
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const purchaseFormSchema = z.object({
  kategori_id: z.string().min(1, "Kategori produk harus dipilih"),
  product_name: z.string().min(1, "Nama produk harus diisi"),
  barcode: z.string().optional(),
  quantity: z.number().min(1, "Jumlah harus lebih dari 0"),
  unit_price: z.number().min(1, "Harga satuan harus lebih dari 0"),
  total_price: z.number().optional(),
  cabang_id: z.string().min(1, "Cabang harus dipilih"),
  payment_status: z.string().min(1, "Status pembayaran harus dipilih"),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

export const PurchaseForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      quantity: 0,
      unit_price: 0,
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .single();

      if (pelakuUsahaData) {
        const { data } = await supabase
          .from('kategori_produk')
          .select('*')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);
        return data;
      }
      return [];
    },
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .single();

      if (pelakuUsahaData) {
        const { data } = await supabase
          .from('cabang')
          .select('*')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);
        return data;
      }
      return [];
    },
  });

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .single();

      if (!pelakuUsahaData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Data pelaku usaha tidak ditemukan",
        });
        return;
      }

      const { data: newProduct, error: productError } = await supabase
        .from('produk')
        .insert({
          pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
          kategori_id: parseInt(data.kategori_id),
          product_name: data.product_name,
          barcode: data.barcode,
          cost_price: data.unit_price,
          retail_price: data.unit_price * 1.2, // Example markup
          stock: data.quantity
        })
        .select()
        .single();

      if (productError) {
        console.error('Error creating product:', productError);
        throw productError;
      }

      // Create purchase record
      const purchaseData = {
        cabang_id: parseInt(data.cabang_id),
        produk_id: newProduct.produk_id,
        quantity: data.quantity,
        unit_price: data.unit_price,
        total_price: data.quantity * data.unit_price,
        payment_status: data.payment_status === "1" ? 1 : 0,
      };

      const { error: purchaseError } = await supabase
        .from('pembelian')
        .insert(purchaseData);

      if (purchaseError) {
        console.error('Error creating purchase:', purchaseError);
        throw purchaseError;
      }

      // Create product history record
      const { error: historyError } = await supabase
        .from('produk_history')
        .insert({
          produk_id: newProduct.produk_id,
          cost_price: data.unit_price,
          stock: data.quantity,
        });

      if (historyError) {
        console.error('Error creating history:', historyError);
        throw historyError;
      }

      toast({
        title: "Sukses",
        description: "Pembelian berhasil ditambahkan",
      });

      navigate("/purchase");
    } catch (error: any) {
      console.error('Error submitting purchase:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menambahkan pembelian",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Tambah Pembelian Baru</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="kategori_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Kategori Produk</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori produk" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem 
                        key={category.kategori_id} 
                        value={category.kategori_id.toString()}
                      >
                        {category.kategori_name}
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
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Nama Produk</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama produk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Scan atau masukkan barcode produk" 
                    {...field}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Jumlah</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Masukkan jumlah" 
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
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Harga Satuan</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="Masukkan harga satuan"
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
            name="cabang_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Cabang</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cabang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem 
                        key={branch.cabang_id} 
                        value={branch.cabang_id.toString()}
                      >
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
            name="payment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Status Pembayaran</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status pembayaran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Lunas</SelectItem>
                    <SelectItem value="0">Belum Lunas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/purchase")}
            >
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
