
import { CartItem } from "@/types/pos";

interface UseProductListProps {
  products: CartItem[];
  onAddToCart: (product: CartItem) => void;
  isRegisteredCustomer: boolean;
}

export const useProductList = ({ 
  products, 
  onAddToCart, 
  isRegisteredCustomer 
}: UseProductListProps) => {
  const handleAddToCart = (product: CartItem) => {
    // If customer is registered and member price exists, use member price
    const priceToUse = isRegisteredCustomer && product.member_price_1 
      ? product.member_price_1 
      : product.price;

    onAddToCart({
      ...product,
      price: priceToUse
    });
  };

  return {
    handleAddToCart
  };
};
