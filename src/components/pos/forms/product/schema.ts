
import * as z from "zod";

export const productFormSchema = z.object({
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

export type ProductFormValues = z.infer<typeof productFormSchema>;
