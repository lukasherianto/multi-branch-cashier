
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";

export interface TransferHeaderData {
  cabang_id_from: number;
  cabang_id_to: number;
  pelaku_usaha_id: number;
  status: string;
  total_items: number;
  total_quantity: number;
  notes: string;
  produk_id: number; // Required by schema but will be updated in details
  quantity: number;  // Required by schema but will be updated in details
}

export interface TransferDetailData {
  transfer_id: number;
  produk_id: number;
  quantity: number;
  retail_price: number;
  cost_price: number;
}
