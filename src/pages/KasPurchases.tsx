
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  produk_id: z.string().min(1, "Produk harus dipilih"),
  description: z.string().optional(),
  quantity: z.string().min(1, "Jumlah harus diisi"),
  unit_price: z.string().min(1, "Harga satuan harus diisi"),
  payment_status: z.string().min(1, "Status pembayaran harus dipilih"),
  jadwal_lunas: z.string().optional(),
  tanggal_dilunaskan: z.string().optional(),
  transaction_date: z.string().min(1, "Tanggal transaksi harus diisi"),
});

interface Product {
  produk_id: number;
  product_name: string;
}

const KasPurchases = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      produk_id: "",
      description: "",
      quantity: "",
      unit_price: "",
      payment_status: "0",
      jadwal_lunas: "",
      tanggal_dilunaskan: "",
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("produk")
        .select("produk_id, product_name");
      
      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      setProducts(data);
    };

    fetchProducts();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const totalPrice = parseFloat(values.quantity) * parseFloat(values.unit_price);

      const { error } = await supabase.from("pembelian").insert({
        produk_id: parseInt(values.produk_id),
        quantity: parseInt(values.quantity),
        unit_price: parseFloat(values.unit_price),
        total_price: totalPrice,
        payment_status: parseInt(values.payment_status),
        jadwal_lunas: values.jadwal_lunas || null,
        tanggal_dilunaskan: values.tanggal_dilunaskan || null,
        transaction_date: new Date(values.transaction_date).toISOString(),
        description: values.description || null,
        cabang_id: 1, // Ganti dengan cabang_id yang sesuai
      });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Pembelian berhasil dicatat",
      });

      form.reset();
    } catch (error) {
      console.error("Error recording purchase:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat pembelian",
        variant: "destructive",
      });
    }
  };

  const watchPaymentStatus = form.watch("payment_status");

  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Pembelian Baru</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Transaksi</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="produk_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produk</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem
                          key={product.produk_id}
                          value={product.produk_id.toString()}
                        >
                          {product.product_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} className="h-9" />
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
                    <FormLabel>Harga Satuan (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Keterangan pembelian"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status pembayaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Belum Lunas</SelectItem>
                      <SelectItem value="1">Lunas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchPaymentStatus === "0" && (
              <FormField
                control={form.control}
                name="jadwal_lunas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jadwal Pelunasan</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchPaymentStatus === "1" && (
              <FormField
                control={form.control}
                name="tanggal_dilunaskan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Pelunasan</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full">
              Simpan Pembelian
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default KasPurchases;

