
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
import { supabase } from "@/integrations/supabase/client";

const POS = () => {
  const navigate = useNavigate();
  const { pelakuUsaha, cabang, cabangList, selectedCabangId, setSelectedCabangId } = useAuth();
  const { filteredProducts, handleSearch, fetchProducts } = useProducts();
  const { cartItems, addToCart, updateQuantity, removeItem, clearCart } = useCart();
  
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
      // Validate stock for all items
      for (const item of cartItems) {
        const { data: productData } = await supabase
          .from('produk')
          .select('stock')
          .eq('produk_id', item.id)
          .single();

        if (!productData || productData.stock < item.quantity) {
          toast.error(`Stok tidak cukup untuk produk: ${item.name}`);
          return;
        }
      }

      // Calculate total before points
      const totalBeforePoints = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate total after points
      const finalTotal = totalBeforePoints - (pointsToUse * 1000);

      // Create transactions for each item
      const transactionPromises = cartItems.map(item => 
        supabase
          .from('transaksi')
          .insert({
            cabang_id: selectedCabangId,
            produk_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            points_used: pointsToUse > 0 ? Math.floor((item.price * item.quantity / totalBeforePoints) * pointsToUse) : 0,
            pelanggan_id: memberId,
            transaction_date: new Date().toISOString()
          })
          .select()
      );

      const results = await Promise.all(transactionPromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        console.error('Errors processing transactions:', errors);
        throw new Error('Failed to process some transactions');
      }

      // Update product stock
      const stockUpdatePromises = cartItems.map(async item => {
        const { data: currentProduct } = await supabase
          .from('produk')
          .select('stock')
          .eq('produk_id', item.id)
          .single();
        
        if (currentProduct) {
          return supabase
            .from('produk')
            .update({ 
              stock: currentProduct.stock - item.quantity 
            })
            .eq('produk_id', item.id);
        }
      });

      await Promise.all(stockUpdatePromises);

      // Clear cart and refresh products
      clearCart();
      fetchProducts();

      // Navigate to print preview
      navigate('/print-preview', {
        state: {
          items: cartItems,
          total: finalTotal,
          pointsUsed: pointsToUse,
          pointsEarned: Math.floor(finalTotal / 1000),
          businessName: pelakuUsaha?.business_name,
          branchName: cabang?.branch_name,
          customerName: customerName,
          whatsappNumber: whatsappNumber
        }
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Gagal memproses pembayaran");
    }
  };

  const handleCustomerFound = (customer: any) => {
    console.log('Customer found:', customer);
    setIsRegisteredCustomer(true);
    setMemberId(customer.member_id);
    setMemberPoints(customer.loyalty_points || 0);
  };

  const handleNewCustomer = () => {
    console.log('New customer initiated');
    setIsRegisteredCustomer(false);
    setMemberId(null);
    setMemberPoints(0);
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
          onNewCustomer={handleNewCustomer}
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
