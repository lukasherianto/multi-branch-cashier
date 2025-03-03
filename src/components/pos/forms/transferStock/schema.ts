
import { z } from "zod";

export const schema = z.object({
  cabang_id_from: z.string(),
  cabang_id_to: z.string(),
  products: z.array(
    z.object({
      produk_id: z.number().optional(),
      quantity: z.number().min(1, "Jumlah minimal 1").optional(),
      selected: z.boolean().optional()
    })
  ).optional(),
  notes: z.string().optional()
});

export type TransferStockFormValues = z.infer<typeof schema>;
