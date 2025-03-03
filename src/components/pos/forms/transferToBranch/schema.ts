
import { z } from "zod";
import { TransferToBranchValues } from "@/types/pos";

export const schema = z.object({
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

// Export the type for form values
export type { TransferToBranchValues };
