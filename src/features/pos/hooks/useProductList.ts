
import { CartItem } from "@/types/pos";

interface UseProductListProps {
  products: CartItem[];
  onAddToCart: (product: CartItem) => void;
  isRegisteredCustomer: boolean;
  memberType: "none" | "member1" | "member2";
}

export const useProductList = ({ 
  products, 
  onAddToCart, 
  isRegisteredCustomer,
  memberType
}: UseProductListProps) => {
  const handleAddToCart = (product: CartItem) => {
    let priceToUse = product.price; // Default retail price
    
    // If registered customer, check member type and apply appropriate price
    if (isRegisteredCustomer) {
      if (memberType === "member1" && product.member_price_1) {
        priceToUse = product.member_price_1;
      } else if (memberType === "member2" && product.member_price_2) {
        priceToUse = product.member_price_2;
      }
    }

    onAddToCart({
      ...product,
      price: priceToUse
    });
  };

  return {
    handleAddToCart
  };
};
