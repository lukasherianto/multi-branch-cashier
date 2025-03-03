
export interface CartItem {
  id: number;
  name: string;
  price: number;
  member_price_1?: number | null;
  member_price_2?: number | null;
  quantity: number;
  category?: string;
  stock: number;
  barcode?: string;
  unit: string;
  cost_price: number;
  cabang_id: number;
  selected?: boolean;
  produk_id?: number; // Added for compatibility with some components
}

export interface Customer {
  whatsappNumber: string;
  customerName: string;
  birthDate: Date | null;
  isRegistered: boolean;
  memberId?: number;
  loyaltyPoints?: number;
}

// Export the ProductWithSelection type that's used in transfer components
export interface ProductWithSelection extends CartItem {
  selected: boolean;
}

// Define the transfer form values type - all required fields match schema
export interface TransferStockFormValues {
  cabang_id_from: string;
  cabang_id_to: string;
  products?: {
    produk_id?: number;
    quantity?: number;
    selected?: boolean;
  }[];
  notes?: string;
}

// Define the transfer to branch values type - required fields match schema
export interface TransferToBranchValues {
  cabang_id_to: string;
  products?: {
    produk_id?: number;
    quantity?: number;
    selected?: boolean;
  }[];
  notes?: string;
}
