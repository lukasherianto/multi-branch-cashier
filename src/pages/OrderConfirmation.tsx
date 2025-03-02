
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { useState } from "react";
import { CartItem } from "@/types/pos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    cartItems,
    finalTotal,
    pointsToUse,
    customerName,
    whatsappNumber,
    isRegisteredCustomer,
    memberId,
    selectedCabangId,
    pelakuUsahaId
  } = location.state || {};

  if (!cartItems || finalTotal === undefined) {
    navigate('/pos');
    return null;
  }

  const handleConfirmPayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Validate stock for all items
      for (const item of cartItems) {
        const { data: productData, error: productError } = await supabase
          .from('produk')
          .select('stock')
          .eq('produk_id', item.id)
          .single();

        if (productError) {
          console.error("Error fetching product stock:", productError);
          throw new Error(`Error validating stock for ${item.name}: ${productError.message}`);
        }

        if (!productData || productData.stock < item.quantity) {
          throw new Error(`Stok tidak cukup untuk produk: ${item.name}`);
        }
      }

      // Calculate total before points
      const totalBeforePoints = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
      
      // Create transactions for each item
      console.log("Creating transactions for items:", cartItems.length);
      const transactionPromises = cartItems.map(async (item: CartItem) => {
        const pointsForItem = pointsToUse > 0 
          ? Math.floor((item.price * item.quantity / totalBeforePoints) * pointsToUse) 
          : 0;
          
        console.log(`Creating transaction for item ${item.id}, points allocated: ${pointsForItem}`);
        
        const result = await supabase
          .from('transaksi')
          .insert({
            cabang_id: selectedCabangId,
            produk_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            points_used: pointsForItem,
            pelanggan_id: memberId,
            transaction_date: new Date().toISOString()
          })
          .select();
          
        if (result.error) {
          console.error(`Error creating transaction for item ${item.id}:`, result.error);
          throw result.error;
        }
        
        return result;
      });

      await Promise.all(transactionPromises);

      // Update product stock
      const stockUpdatePromises = cartItems.map(async (item: CartItem) => {
        const { data: currentProduct, error: fetchError } = await supabase
          .from('produk')
          .select('stock')
          .eq('produk_id', item.id)
          .single();
        
        if (fetchError) {
          console.error(`Error fetching current stock for product ${item.id}:`, fetchError);
          throw fetchError;
        }
        
        if (currentProduct) {
          const newStock = currentProduct.stock - item.quantity;
          
          const { error: updateError } = await supabase
            .from('produk')
            .update({ 
              stock: newStock 
            })
            .eq('produk_id', item.id);
            
          if (updateError) {
            console.error(`Error updating stock for product ${item.id}:`, updateError);
            throw updateError;
          }
        }
      });

      await Promise.all(stockUpdatePromises);

      // Create a manual kas entry for the transaction
      const { error: kasError } = await supabase
        .from('kas')
        .insert({
          cabang_id: selectedCabangId,
          amount: finalTotal,
          transaction_type: 'masuk',
          description: `Penjualan - ${paymentMethod.toUpperCase()} - ${new Date().toLocaleString()}`,
          transaction_date: new Date().toISOString()
        });
      
      if (kasError) {
        console.error('Error creating kas entry:', kasError);
        toast.warning("Transaksi berhasil, tetapi gagal mencatat di buku kas.");
      }

      // If points were used, create a matching kas entry for the redemption
      if (pointsToUse > 0) {
        const { error: pointsKasError } = await supabase
          .from('kas')
          .insert({
            cabang_id: selectedCabangId,
            amount: pointsToUse * 1000,
            transaction_type: 'keluar',
            description: `Penukaran Poin - ${new Date().toLocaleString()}`,
            transaction_date: new Date().toISOString()
          });
          
        if (pointsKasError) {
          console.error('Error creating kas entry for points redemption:', pointsKasError);
        }
      }

      // Get business information for the invoice
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('business_name')
        .eq('pelaku_usaha_id', pelakuUsahaId)
        .single();

      const { data: cabangData } = await supabase
        .from('cabang')
        .select('branch_name')
        .eq('cabang_id', selectedCabangId)
        .single();

      // Navigate to print preview
      navigate('/print-preview', {
        state: {
          items: cartItems,
          total: finalTotal,
          pointsUsed: pointsToUse,
          pointsEarned: Math.floor(finalTotal / 1000),
          businessName: pelakuUsahaData?.business_name,
          branchName: cabangData?.branch_name,
          customerName,
          whatsappNumber,
          paymentMethod
        }
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Gagal memproses pembayaran: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-center">Konfirmasi Pesanan</h1>
          
          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="font-semibold mb-2">Informasi Pelanggan</h2>
            <p><span className="font-medium">Nama:</span> {customerName || 'Pelanggan Umum'}</p>
            {whatsappNumber && (
              <p><span className="font-medium">WhatsApp:</span> {whatsappNumber}</p>
            )}
            {isRegisteredCustomer && (
              <p><span className="font-medium">Status:</span> Pelanggan Terdaftar</p>
            )}
          </div>
          
          {/* Order Items */}
          <div>
            <h2 className="font-semibold mb-2">Rincian Produk</h2>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cartItems.map((item: CartItem) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Payment Summary */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
              </div>
              
              {pointsToUse > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Poin Digunakan ({pointsToUse} poin)</span>
                  <span>- Rp {(pointsToUse * 1000).toLocaleString('id-ID')}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Method Selection */}
          <div>
            <h2 className="font-semibold mb-2">Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={paymentMethod === 'cash' ? 'default' : 'outline'} 
                className="flex items-center justify-center gap-2 py-6"
                onClick={() => setPaymentMethod('cash')}
              >
                <Wallet />
                <span>Tunai</span>
              </Button>
              <Button 
                variant={paymentMethod === 'qris' ? 'default' : 'outline'} 
                className="flex items-center justify-center gap-2 py-6"
                onClick={() => setPaymentMethod('qris')}
              >
                <CreditCard />
                <span>QRIS</span>
              </Button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="w-1/2" onClick={() => navigate('/pos')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button 
              className="w-1/2" 
              onClick={handleConfirmPayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
