
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "./schema";

interface BasicInfoFieldsProps {
  form: UseFormReturn<ProductFormValues>;
  categories: any[] | undefined;
}

export function BasicInfoFields({ form, categories }: BasicInfoFieldsProps) {
  return (
    <>
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
    </>
  );
}
