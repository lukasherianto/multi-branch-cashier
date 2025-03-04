
export interface Transaction {
  id: string | number;
  transaction_id?: string | number;
  customer_id?: string | number;
  customer_name?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
  payment_method?: string;
  notes?: string;
  items?: TransactionItem[];
  pelaku_usaha_id?: number;
  cabang_id?: number;
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
