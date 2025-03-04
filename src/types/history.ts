
export interface TransactionForTable {
  transaksi_id: number;
  transaction_date: string;
  produk: {
    produk_id: number;
    product_name: string;
  };
  quantity: number;
  total_price: number;
  payment_status: number;
  cabang: {
    branch_name: string;
  };
  payment_method?: string;
}

// Define a simpler type for the raw data returned from Supabase
export interface RawTransaction {
  transaksi_id: number;
  transaction_date: string;
  created_at: string;
  quantity: number;
  total_price: number;
  payment_status: number;
  payment_method?: string;
  produk_id: number;
  cabang_id: number;
}
