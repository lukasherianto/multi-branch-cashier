
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; // Menambahkan import supabase

const POS = () => {
  const navigate = useNavigate();
  const { pelakuUsaha, cabang, cabangList, selectedCabangId, setSelectedCabangId } = useAuth();
  const { filteredProducts, handleSearch } = useProducts();
  const { cartItems, addToCart, updateQuantity, removeItem } = useCart();
  
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isRegisteredCustomer, setIsRegisteredCustomer] = useState(false);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [memberPoints, setMemberPoints] = useState<number>(0);

  const handlePayment = async (pointsToUse: number) => {
    if (!cabang) {
      toast.error("Silakan pilih cabang terlebih dahulu");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Tambahkan produk ke keranjang terlebih dahulu");
      return;
    }

    try {
      // Calculate total before points
      const totalBeforePoints = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate total after points
      const finalTotal = totalBeforePoints - (pointsToUse * 1000);

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transaksi')
        .insert({
          cabang_id: selectedCabangId,
          total_price: finalTotal,
          points_used: pointsToUse,
          pelanggan_id: memberId,
          transaction_date: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Navigate to print preview
      navigate('/print-preview', {
        state: {
          items: cartItems,
          total: finalTotal,
          pointsUsed: pointsToUse,
          pointsEarned: Math.floor(finalTotal / 1000),
          businessName: pelakuUsaha?.business_name,
          branchName: cabang?.branch_name
        }
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Gagal memproses pembayaran");
    }
  };

  const handleCustomerFound = (customer: any) => { // Menghapus async karena tidak diperlukan
    setIsRegisteredCustomer(true);
    setMemberId(customer.member_id);
    setMemberPoints(customer.loyalty_points || 0);
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Kasir</h2>
          {cabangList.length > 1 && (
            <Select
              value={selectedCabangId?.toString()}
              onValueChange={(value) => setSelectedCabangId(parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Cabang" />
              </SelectTrigger>
              <SelectContent>
                {cabangList.map((branch) => (
                  <SelectItem 
                    key={branch.cabang_id} 
                    value={branch.cabang_id.toString()}
                  >
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <CustomerInfo
          whatsappNumber={whatsappNumber}
          setWhatsappNumber={setWhatsappNumber}
          customerName={customerName}
          setCustomerName={setCustomerName}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          onCustomerFound={handleCustomerFound}
          onNewCustomer={() => {
            setIsRegisteredCustomer(false);
            setMemberId(null);
            setMemberPoints(0);
          }}
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
        customerPoints={memberPoints}
      />
    </div>
  );
};

export default POS;
