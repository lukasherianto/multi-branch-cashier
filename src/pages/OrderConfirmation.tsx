
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppInput } from "@/components/settings/WhatsAppInput";
import { useState } from "react";
import { toast } from "sonner";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    cartItems, 
    finalTotal, 
    pointsToUse, 
    handlePayment, 
    customerName: existingCustomerName,
    whatsappNumber: existingWhatsappNumber,
    isRegisteredCustomer
  } = location.state || {};
  
  const [customerName, setCustomerName] = useState(existingCustomerName || "");
  const [whatsappNumber, setWhatsappNumber] = useState(existingWhatsappNumber || "");
  
  if (!cartItems || cartItems.length === 0) {
    navigate('/pos');
    return null;
  }

  const handleConfirm = () => {
    if (!isRegisteredCustomer && !customerName) {
      toast.error("Silakan masukkan nama pelanggan");
      return;
    }
    
    handlePayment(pointsToUse, customerName, whatsappNumber);
  };
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Konfirmasi Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isRegisteredCustomer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nama Pelanggan</Label>
                <Input 
                  id="customerName" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama pelanggan"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nomor WhatsApp (Opsional)</Label>
                <WhatsAppInput 
                  value={whatsappNumber}
                  onChange={setWhatsappNumber}
                  onCheck={null}
                  onSave={null}
                />
              </div>
            </div>
          )}
          
          {isRegisteredCustomer && (
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="font-medium">Pelanggan: {existingCustomerName}</p>
              <p className="text-sm">WhatsApp: {existingWhatsappNumber}</p>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Daftar Pesanan:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">Rp {item.price.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pointsToUse > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Poin Digunakan</span>
              <span>- Rp {(pointsToUse * 1000).toLocaleString('id-ID')}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg">
            <span>Total Akhir</span>
            <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/pos')}
          >
            Kembali
          </Button>
          <Button 
            onClick={handleConfirm}
          >
            Konfirmasi & Proses Pembayaran
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
