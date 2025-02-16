
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  produk_id: z.string().min(1, { message: "Pilih produk" }),
  cabang_id: z.string().min(1, { message: "Pilih cabang" }),
  quantity: z.string().min(1, { message: "Masukkan jumlah" }),
  unit_price: z.string().min(1, { message: "Masukkan harga satuan" }),
  payment_status: z.string().min(1, { message: "Pilih status pembayaran" }),
  jadwal_lunas: z.date().optional(),
  transaction_date: z.date({
    required_error: "Pilih tanggal transaksi",
  }),
});

export const PurchaseForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pelakuUsaha } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transaction_date: new Date(),
    },
  });

  const { data: branches } = useQuery({
    queryKey: ['branches', pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return [];
      
      const { data, error } = await supabase
        .from('cabang')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

      if (error) throw error;

      // Add kantor pusat as a branch option
      const kantorPusat = {
        cabang_id: 0,
        branch_name: 'Kantor Pusat',
        pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
        address: pelakuUsaha.address,
        contact_whatsapp: pelakuUsaha.contact_whatsapp,
      };

      return [kantorPusat, ...(data || [])];
    },
    enabled: !!pelakuUsaha,
  });

  const { data: products } = useQuery({
    queryKey: ['products', pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return [];
      
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

      if (error) throw error;
      return data;
    },
    enabled: !!pelakuUsaha,
  });

  const paymentStatus = [
    { value: "1", label: "Lunas" },
    { value: "0", label: "Belum Lunas" },
  ];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const totalPrice = Number(values.quantity) * Number(values.unit_price);
      const jadwalLunas = values.payment_status === "0" ? values.jadwal_lunas?.toISOString() : null;
      const tanggalDilunaskan = values.payment_status === "1" ? new Date().toISOString() : null;

      // Insert pembelian record
      const { error: pembelianError } = await supabase
        .from('pembelian')
        .insert({
          cabang_id: Number(values.cabang_id),
          produk_id: Number(values.produk_id),
          quantity: Number(values.quantity),
          unit_price: Number(values.unit_price),
          total_price: totalPrice,
          payment_status: Number(values.payment_status),
          jadwal_lunas: jadwalLunas,
          tanggal_dilunaskan: tanggalDilunaskan,
          transaction_date: values.transaction_date.toISOString(),
        });

      if (pembelianError) throw pembelianError;

      // First, get the current stock
      const { data: productData, error: productError } = await supabase
        .from('produk')
        .select('stock')
        .eq('produk_id', Number(values.produk_id))
        .single();

      if (productError) throw productError;

      // Then update the product with new stock and cost_price
      const { error: stockError } = await supabase
        .from('produk')
        .update({
          stock: (productData?.stock || 0) + Number(values.quantity),
          cost_price: Number(values.unit_price),
        })
        .eq('produk_id', Number(values.produk_id));

      if (stockError) throw stockError;

      // Insert into produk_history
      const { error: historyError } = await supabase
        .from('produk_history')
        .insert({
          produk_id: Number(values.produk_id),
          stock: Number(values.quantity),
          cost_price: Number(values.unit_price),
          entry_date: values.transaction_date.toISOString(),
        });

      if (historyError) throw historyError;

      toast({
        title: "Sukses",
        description: "Transaksi pembelian berhasil ditambahkan",
      });

      navigate("/purchase");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan transaksi pembelian",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!pelakuUsaha) {
      toast({
        title: "Error",
        description: "Silakan lengkapi profil usaha Anda terlebih dahulu",
        variant: "destructive",
      });
      navigate("/settings");
    }
  }, [pelakuUsaha, navigate, toast]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tambah Pembelian</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {products?.map((product) => (
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

            <FormField
              control={form.control}
              name="cabang_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cabang</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                          {branch.cabang_id === 0 && (
                            <Home className="inline-block ml-2 h-4 w-4" />
                          )}
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
                    <Input type="number" min="1" {...field} />
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
                    <Input type="number" min="0" {...field} />
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
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "1") {
                        form.setValue("jadwal_lunas", undefined);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status pembayaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentStatus.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("payment_status") === "0" && (
              <FormField
                control={form.control}
                name="jadwal_lunas"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Jadwal Lunas</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "P")
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Transaksi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "P")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/purchase")}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
