
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { PurchaseFormData } from "./types";

interface PurchaseFormFieldsProps {
  form: UseFormReturn<PurchaseFormData>;
  categories: any[];
  branches: any[];
}

export const PurchaseFormFields = ({ form, categories, branches }: PurchaseFormFieldsProps) => {
  return (
    <>
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

      <FormField
        control={form.control}
        name="is_price_change"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Perubahan Harga
              </FormLabel>
              <FormDescription>
                Centang jika ada perubahan harga dari pembelian sebelumnya
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Catatan Perubahan Harga</FormLabel>
            <FormControl>
              <Input 
                placeholder="Contoh: Kenaikan harga supplier"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
