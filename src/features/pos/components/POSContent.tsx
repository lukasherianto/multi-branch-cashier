
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ProductList } from "@/components/pos/ProductList";
import { CustomerInfo } from "@/components/pos/CustomerInfo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useCustomerManagement } from "../hooks/useCustomerManagement";
import { ShoppingCart } from "@/components/pos/ShoppingCart";
import { usePaymentHandler } from "./PaymentHandler";

export const POSContent = () => {
  const { pelakuUsaha, cabang, cabangList, selectedCabangId, setSelectedCabangId } = useAuth();
  const { filteredProducts, handleSearch, fetchProducts } = useProducts();
  const { cartItems, addToCart, updateQuantity, removeItem, clearCart } = useCart();
  
  const {
    whatsappNumber,
    setWhatsappNumber,
    customerName,
    setCustomerName,
    birthDate,
    setBirthDate,
    isRegisteredCustomer,
    memberId,
    memberPoints,
    memberType,
    handleCustomerFound,
    handleNewCustomer,
    handleChangeMemberType
  } = useCustomerManagement();

  const { handlePayment } = usePaymentHandler({
    cartItems,
    selectedCabangId,
    cabang,
    memberId,
    customerName,
    whatsappNumber,
    clearCart,
    fetchProducts,
    pelakuUsaha
  });

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
          memberType={memberType}
          onChangeMemberType={handleChangeMemberType}
          isRegisteredCustomer={isRegisteredCustomer}
        />

        <ProductSearch onSearch={handleSearch} />

        <ProductList
          products={filteredProducts}
          onAddToCart={addToCart}
          isRegisteredCustomer={isRegisteredCustomer}
          memberType={memberType}
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
