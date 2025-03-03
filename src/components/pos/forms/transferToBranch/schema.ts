
import * as z from "zod";

export const transferToBranchSchema = z.object({
  cabang_id_to: z.string(),
  products: z.array(z.object({
    produk_id: z.number(),
    quantity: z.number().min(1, "Jumlah harus lebih dari 0"),
    selected: z.boolean()
  }))
});

export type TransferToBranchFormValues = z.infer<typeof transferToBranchSchema>;

export interface ProductTransfer {
  produk_id: number;
  quantity: number;
  selected: boolean;
  product_name: string;
  stock: number;
  cost_price: number;
}

export const ITEMS_PER_PAGE = 100;
