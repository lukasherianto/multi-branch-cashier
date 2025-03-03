
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Receipt } from "lucide-react";
import { usePaymentHandler } from "@/features/pos/components/PaymentHandler";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  if (!cartItems || cartItems.length === 0) {
    navigate('/pos');
    return null;
  }

  const validateMemberId = async (id: number | null) => {
    if (id === null) return true; // Null memberId is valid (non-member transaction)
    
    const { data, error } = await supabase
      .from('pelanggan')  // Use pelanggan table instead of member
      .select('pelanggan_id')
      .eq('pelanggan_id', id)
      .maybeSingle();
      
    if (error || !data) {
      console.error("Pelanggan validation failed:", error || "Pelanggan not found");
      return false;
    }
    
    return true;
  };

  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      if (isRegisteredCustomer && memberId) {
        const isValidMember = await validateMemberId(memberId);
        if (!isValidMember) {
          throw new Error("Data pelanggan tidak valid. Silakan periksa kembali pelanggan.");
        }
      }
      
      // Pass the payment method to the handlePayment function
      await handlePayment(pointsToUse || 0, customerName, whatsappNumber, paymentMethod);
      // Navigation to print-preview is handled inside handlePayment
    } catch (error) {
      console.error("Payment error:", error);
      
      let message = "Gagal memproses pembayaran";
      if (error instanceof Error) {
        if (error.message.includes("violates foreign key constraint")) {
          message = "Data pelanggan tidak valid. Pastikan pelanggan sudah terdaftar.";
        } else if (error.message.includes("Failed to process")) {
          message = "Gagal memproses transaksi. Silakan coba lagi atau hubungi admin.";
        } else {
          message = `Error: ${error.message}`;
        }
      }
      
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

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
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Konfirmasi Transaksi</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {customerName && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-lg mb-2">Informasi Pelanggan</h3>
                <p><strong>Nama:</strong> {customerName}</p>
                {whatsappNumber && <p><strong>WhatsApp:</strong> {whatsappNumber}</p>}
                {isRegisteredCustomer && (
                  <>
                    <p><strong>Tipe Member:</strong> {memberType === "none" ? "Non-Member" : memberType === "member1" ? "Member 1" : "Member 2"}</p>
                    <p><strong>Poin:</strong> {memberPoints}</p>
                  </>
                )}
              </div>
            )}

            <div>
              <h3 className="font-medium text-lg mb-2">Rincian Produk</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Produk</th>
                      <th className="py-2 px-4 text-center">Jumlah</th>
                      <th className="py-2 px-4 text-right">Harga</th>
                      <th className="py-2 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cartItems.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">Rp {item.price.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-4 text-right">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pointsToUse > 0 && (
              <div className="flex justify-between text-red-500 font-medium">
                <span>Poin Digunakan ({pointsToUse} poin)</span>
                <span>- Rp {(pointsToUse * 1000).toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold">
              <span>Total Pembayaran</span>
              <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
            </div>

            <div className="pt-4">
              <h3 className="font-medium text-lg mb-3">Metode Pembayaran</h3>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "cash" | "qris")}>
                <div className="flex items-center space-x-2 border p-3 rounded-md mb-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer flex-1">Tunai</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="qris" id="qris" />
                  <Label htmlFor="qris" className="cursor-pointer flex-1">QRIS</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          
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
