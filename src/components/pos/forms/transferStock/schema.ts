
import { z } from "zod";

export const transferStockSchema = z.object({
  cabang_id_from: z.string(),
  cabang_id_to: z.string(),
  products: z.array(
    z.object({
      produk_id: z.number(),
      quantity: z.number().min(1, "Jumlah minimal 1"),
      selected: z.boolean().optional()
    })
  )
});

export type TransferStockFormValues = z.infer<typeof transferStockSchema>;
