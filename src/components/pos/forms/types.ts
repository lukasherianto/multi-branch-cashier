
import * as z from "zod";

export const purchaseFormSchema = z.object({
  kategori_id: z.string().min(1, "Kategori produk harus dipilih"),
  product_name: z.string().min(1, "Nama produk harus diisi"),
  barcode: z.string().optional(),
  quantity: z.number().min(1, "Jumlah harus lebih dari 0"),
  unit_price: z.number().min(1, "Harga satuan harus lebih dari 0"),
  total_price: z.number().optional(),
  cabang_id: z.string().min(1, "Cabang harus dipilih"),
  payment_status: z.string().min(1, "Status pembayaran harus dipilih"),
  price_notes: z.string().optional(),
  is_price_change: z.boolean().default(false),
});

export type PurchaseFormData = z.infer<typeof purchaseFormSchema>;
