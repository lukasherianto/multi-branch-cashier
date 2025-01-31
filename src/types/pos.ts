export interface CartItem {
  id: number;
  name: string;
  price: number;
  member_price?: number | null;
  quantity: number;
  category?: string;
  stock: number;
  barcode?: string;
}

export interface Customer {
  whatsappNumber: string;
  customerName: string;
  birthDate: Date | null;
  isRegistered: boolean;
}