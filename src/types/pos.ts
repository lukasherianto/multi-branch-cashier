
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
}

export interface Customer {
  whatsappNumber: string;
  customerName: string;
  birthDate: Date | null;
  isRegistered: boolean;
  memberId?: number;
  loyaltyPoints?: number;
}
