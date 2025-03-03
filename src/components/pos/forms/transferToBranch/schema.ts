
import * as z from "zod";

// Define the structure of a product for transfer
export const ITEMS_PER_PAGE = 100;

export interface ProductTransfer {
  produk_id: number;
  quantity: number;
  selected: boolean;
  product_name: string;
  stock: number;
  cost_price: number;
}

// Define the validation schema for the transfer form
export const transferToBranchSchema = z.object({
  cabang_id_to: z.string({
    required_error: "Cabang tujuan harus dipilih",
  }),
  products: z.array(z.object({
    produk_id: z.number(),
    quantity: z.number().min(1, "Jumlah harus lebih dari 0"),
    selected: z.boolean()
  })).optional()
});

export type TransferToBranchFormValues = z.infer<typeof transferToBranchSchema>;
