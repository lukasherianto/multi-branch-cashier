import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const productFormSchema = z.object({
  barcode: z.string().optional(),
  product_name: z.string().min(1, "Nama produk harus diisi"),
  kategori_id: z.string().min(1, "Kategori harus dipilih"),
  description: z.string().optional(),
  purchase_number: z.string().optional(),
  stock: z.coerce.number().min(0, "Stok tidak boleh negatif"),
  unit: z.string().min(1, "Satuan harus diisi"),
  cost_price: z.coerce.number().min(0, "Harga modal tidak boleh negatif"),
  retail_price: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
  member_price_1: z.coerce.number().min(0, "Harga member 1 tidak boleh negatif"),
  member_price_2: z.coerce.number().min(0, "Harga member 2 tidak boleh negatif"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProductFormModal({ open, onOpenChange, onSuccess }: ProductFormModalProps) {
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      stock: 0,
      cost_price: 0,
      retail_price: 0,
      member_price_1: 0,
      member_price_2: 0,
      unit: 'Pcs',
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
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

  console.log('Available categories:', categories);

  async function onSubmit(values: ProductFormValues) {
    try {
      console.log('Form values:', values);
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!pelakuUsahaData) throw new Error("Data pelaku usaha tidak ditemukan");

      // Check if barcode already exists
      if (values.barcode) {
        const { data: existingProduct } = await supabase
          .from('produk')
          .select('product_name')
          .eq('barcode', values.barcode)
          .single();

        if (existingProduct) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Barcode sudah digunakan untuk produk: ${existingProduct.product_name}`,
          });
          return;
        }
      }

      const { error } = await supabase
        .from('produk')
        .insert({
          pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
          kategori_id: parseInt(values.kategori_id),
          product_name: values.product_name,
          barcode: values.barcode || null,
          cost_price: values.cost_price,
          retail_price: values.retail_price,
          member_price_1: values.member_price_1,
          member_price_2: values.member_price_2,
          stock: values.stock,
          unit: values.unit,
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: `Produk ${values.product_name} berhasil ditambahkan ke database`,
      });
      
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menambahkan produk",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input placeholder="Scan atau masukkan barcode" {...field} />
                  </FormControl>
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
              name="kategori_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Kategori</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Masukkan keterangan produk"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchase_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Transaksi Pembelian</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor transaksi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">Jumlah</FormLabel>
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">Satuan</FormLabel>
                    <FormControl>
                      <Input placeholder="Pcs, Box, dll" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
