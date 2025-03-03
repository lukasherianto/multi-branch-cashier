
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Receipt } from "lucide-react";
import { usePaymentHandler } from "@/features/pos/components/PaymentHandler";
import { OrderSummary } from "@/components/order/OrderSummary";
import { ErrorDisplay } from "@/components/order/ErrorDisplay";
import { useOrderConfirmation } from "@/features/order/useOrderConfirmation";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cartItems,
    finalTotal,
    pointsToUse,
    customerName,
    whatsappNumber,
    isRegisteredCustomer,
    memberId,
    memberPoints,
    selectedCabangId,
    pelakuUsahaId,
    memberType
  } = location.state || {};

  const { handlePayment } = usePaymentHandler({
    cartItems: cartItems || [],
    selectedCabangId,
    cabang: { cabang_id: selectedCabangId, branch_name: "" },
    memberId: memberId || null,
    customerName: customerName || "",
    whatsappNumber: whatsappNumber || "",
    clearCart: () => {},
    fetchProducts: () => {},
    pelakuUsaha: { pelaku_usaha_id: pelakuUsahaId, business_name: "" }
  });

  const {
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    errorMessage,
    handleConfirmPayment
  } = useOrderConfirmation({
    handlePayment,
    isRegisteredCustomer,
    memberId,
    pointsToUse: pointsToUse || 0,
    customerName: customerName || "",
    whatsappNumber: whatsappNumber || ""
  });

  if (!cartItems || cartItems.length === 0) {
    navigate('/pos');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate("/pos")} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke POS
        </Button>
        
        <ErrorDisplay message={errorMessage} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Konfirmasi Transaksi</CardTitle>
          </CardHeader>
          
          <OrderSummary
            customerName={customerName}
            whatsappNumber={whatsappNumber}
            isRegisteredCustomer={isRegisteredCustomer}
            memberType={memberType}
            memberPoints={memberPoints}
            cartItems={cartItems}
            pointsToUse={pointsToUse || 0}
            finalTotal={finalTotal}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
          
          <CardFooter className="justify-end">
            <Button 
              onClick={handleConfirmPayment} 
              disabled={isProcessing}
              size="lg"
            >
              {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
              {!isProcessing && <Receipt className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
