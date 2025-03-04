
export interface Transaction {
  id: string | number;
  transaction_id?: string | number;
  transaksi_id?: number;
  customer_id?: string | number;
  customer_name?: string;
  pelanggan_id?: number;
  total_amount?: number;
  total_price?: number;
  status?: string;
  payment_status?: number;
  created_at?: string;
  transaction_date?: string;
  payment_method?: string;
  notes?: string;
  items?: TransactionItem[];
  pelaku_usaha_id?: number;
  cabang_id?: number;
  produk_id?: number;
  produk?: {
    produk_id: number;
    product_name: string;
  };
  quantity?: number;
  cabang?: {
    branch_name: string;
  };
}

export interface TransactionItem {
  id: string | number;
  product_id: string | number;
  product_name: string;
  quantity: number;
  price: number;
  discount?: number;
  subtotal: number;
}
