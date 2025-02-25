
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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

interface PurchaseFormData {
  kategori_id: string;
  product_name: string;
  barcode: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cabang_id: string;
  payment_status: string;
}

export const PurchaseForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<PurchaseFormData>();

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

      if (productError) throw productError;

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

      if (purchaseError) throw purchaseError;

      // Create product history record
      const { error: historyError } = await supabase
        .from('produk_history')
        .insert({
          produk_id: newProduct.produk_id,
          cost_price: data.unit_price,
          stock: data.quantity,
        });

      if (historyError) throw historyError;

      toast({
        title: "Sukses",
        description: "Pembelian berhasil ditambahkan",
      });

      navigate("/purchase");
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan pembelian",
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
                <FormLabel>Kategori Produk</FormLabel>
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
                <FormLabel>Nama Produk</FormLabel>
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
                        e.preventDefault(); // Prevent form submission
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
                <FormLabel>Jumlah</FormLabel>
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
                <FormLabel>Harga Satuan</FormLabel>
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
                <FormLabel>Cabang</FormLabel>
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
                <FormLabel>Status Pembayaran</FormLabel>
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
