
import { CartItem, Customer } from "@/types/pos";

export interface POSPageProps {
  // Add any props needed for the main POS page
}

export interface PaymentHandlerProps {
  cartItems: CartItem[];
  selectedCabangId: number | null;
  cabang: any; // Using any temporarily, can be typed more specifically
  memberId: number | null;
  customerName: string;
  whatsappNumber: string;
  clearCart: () => void;
  fetchProducts: () => void;
  pelakuUsaha: any; // Using any temporarily, can be typed more specifically
}
