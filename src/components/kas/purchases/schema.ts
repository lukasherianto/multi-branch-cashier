
import * as z from "zod";

export const purchaseFormSchema = z.object({
  produk_id: z.string().min(1, "Produk harus dipilih"),
  description: z.string().optional(),
  quantity: z.string().min(1, "Jumlah harus diisi"),
  unit_price: z.string().min(1, "Harga satuan harus diisi"),
  payment_status: z.string().min(1, "Status pembayaran harus dipilih"),
  jadwal_lunas: z.string().optional(),
  tanggal_dilunaskan: z.string().optional(),
  transaction_date: z.string().min(1, "Tanggal transaksi harus diisi"),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;
