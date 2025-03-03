
// Define types needed for stock transfer functionality

export interface TransferHeaderData {
  cabang_id_from: number;
  cabang_id_to: number;
  pelaku_usaha_id: number;
  status: string;
  total_items: number;
  total_quantity: number;
  notes: string;
}

export interface TransferDetailData {
  produk_id: number;
  quantity: number;
  retail_price: number;
  cost_price: number;
}
