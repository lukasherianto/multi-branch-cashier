import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CustomerInfo } from "@/components/pos/CustomerInfo";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ProductList } from "@/components/pos/ProductList";
import { ShoppingCart } from "@/components/pos/ShoppingCart";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";

const POS = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pelakuUsaha, cabang } = useAuth();
  const { filteredProducts, handleSearch } = useProducts();
  const { cartItems, addToCart, updateQuantity, removeItem } = useCart();
  
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isRegisteredCustomer, setIsRegisteredCustomer] = useState(false);

  const handlePayment = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Keranjang Kosong",
        description: "Tambahkan produk ke keranjang terlebih dahulu",
      });
      return;
    }

    navigate('/print-preview', {
      state: {
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        businessName: pelakuUsaha?.business_name,
        branchName: cabang?.branch_name
      }
    });
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Kasir</h2>
        </div>

        <CustomerInfo
          whatsappNumber={whatsappNumber}
          setWhatsappNumber={setWhatsappNumber}
          customerName={customerName}
          setCustomerName={setCustomerName}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          onCustomerFound={() => setIsRegisteredCustomer(true)}
          onNewCustomer={() => setIsRegisteredCustomer(false)}
        />

        <ProductSearch onSearch={handleSearch} />

        <ProductList
          products={filteredProducts}
          onAddToCart={addToCart}
          isRegisteredCustomer={isRegisteredCustomer}
        />
      </div>

      <ShoppingCart
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handlePayment}
      />
    </div>
  );
};

export default POS;