
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/types/pos";
import { CreditCard, Wallet } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    cartItems,
    finalTotal,
    pointsToUse = 0,
    customerName,
    whatsappNumber,
    isRegisteredCustomer,
    memberId,
    memberPoints = 0,
    selectedCabangId,
    pelakuUsahaId,
    memberType = "none"
  } = location.state || {};

  useEffect(() => {
    // If we don't have the needed data, go back to POS
    if (!cartItems || !selectedCabangId) {
      toast.error("Data transaksi tidak lengkap");
      navigate("/pos");
    }
  }, [cartItems, selectedCabangId, navigate]);

  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Check stock for each product before processing
      for (const item of cartItems) {
        const { data: stockData } = await supabase
          .from('produk')
          .select('stock')
          .eq('produk_id', item.id)
          .single();
          
        if (!stockData || stockData.stock < item.quantity) {
          toast.error(`Stok tidak mencukupi untuk produk ${item.name}`);
          setIsProcessing(false);
          return;
        }
      }

      // Create transaction record for each item
      const transactionDate = new Date();
      const formattedDate = format(transactionDate, "yyyy-MM-dd'T'HH:mm:ss");
      
      // Generate invoice number
      const invoiceNumber = `INV-${format(transactionDate, 'yyyyMMddHHmmss')}`;
      
      // Process each item in the cart
      const transactionIds = [];
      
      for (const item of cartItems) {
        // Insert transaction record
        const { data: transactionData, error: transactionError } = await supabase
          .from('transaksi')
          .insert({
            cabang_id: selectedCabangId,
            produk_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            transaction_date: formattedDate,
            payment_status: 1, // paid
            pelanggan_id: memberId,
            points_used: pointsToUse > 0 ? pointsToUse : 0,
          })
          .select()
          .single();
          
        if (transactionError) throw transactionError;
        
        // Update product stock
        const { error: stockError } = await supabase
          .from('produk')
          .update({ 
            stock: supabase.rpc('decrement', { x: item.quantity })
          })
          .eq('produk_id', item.id);
          
        if (stockError) throw stockError;
        
        if (transactionData) {
          transactionIds.push(transactionData.transaksi_id);
        }
      }
      
      // Navigate to invoice/receipt page
      navigate('/print-preview', {
        state: {
          invoiceNumber,
          transactionDate: formattedDate,
          cartItems,
          finalTotal,
          pointsToUse,
          customerName,
          whatsappNumber,
          isRegisteredCustomer,
          paymentMethod,
          transactionIds,
          memberPoints,
          remainingPoints: memberPoints - pointsToUse,
        }
      });
      
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error("Gagal memproses pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartItems) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">Konfirmasi Pesanan</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detail Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Nama</p>
              <p>{customerName || "Pelanggan Umum"}</p>
            </div>
            {whatsappNumber && (
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p>{whatsappNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Status Member</p>
              <p>{isRegisteredCustomer 
                  ? memberType === "member1" 
                    ? "Member 1" 
                    : memberType === "member2" 
                      ? "Member 2" 
                      : "Terdaftar" 
                  : "Non-Member"}
              </p>
            </div>
            {isRegisteredCustomer && memberPoints > 0 && (
              <div>
                <p className="text-sm font-medium">Poin</p>
                <p>{memberPoints} poin</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className="flex-col h-20 w-full"
                onClick={() => setPaymentMethod("cash")}
              >
                <Wallet className="h-6 w-6 mb-1" />
                <span>Tunai</span>
              </Button>
              <Button 
                variant={paymentMethod === "qris" ? "default" : "outline"}
                className="flex-col h-20 w-full"
                onClick={() => setPaymentMethod("qris")}
              >
                <CreditCard className="h-6 w-6 mb-1" />
                <span>QRIS</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cartItems.map((item: CartItem, idx: number) => (
              <div key={idx} className="flex justify-between py-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
                <p className="font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p>Rp {cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0).toLocaleString('id-ID')}</p>
            </div>
            
            {pointsToUse > 0 && (
              <div className="flex justify-between text-red-500">
                <p>Poin Digunakan ({pointsToUse} poin)</p>
                <p>- Rp {(pointsToUse * 1000).toLocaleString('id-ID')}</p>
              </div>
            )}
            
            <div className="flex justify-between font-bold text-lg">
              <p>Total</p>
              <p>Rp {finalTotal.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/pos')}>
            Kembali
          </Button>
          <Button 
            onClick={handleConfirmPayment}
            disabled={isProcessing}
          >
            {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
