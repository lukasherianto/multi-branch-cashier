
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, QrCode, Receipt, ChevronsRight, User } from "lucide-react";
import { format } from "date-fns";

interface OrderConfirmationProps {}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    cartItems, 
    finalTotal, 
    pointsToUse, 
    handlePayment, 
    customerName, 
    whatsappNumber,
    isRegisteredCustomer
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [confirmedName, setConfirmedName] = useState(customerName || "");
  const [confirmedWhatsapp, setConfirmedWhatsapp] = useState(whatsappNumber || "");

  if (!cartItems || cartItems.length === 0) {
    navigate("/pos");
    return null;
  }

  const handleConfirmOrder = () => {
    if (!confirmedName.trim()) {
      toast.error("Nama pelanggan harus diisi");
      return;
    }

    if (!confirmedWhatsapp.trim() || confirmedWhatsapp.length < 10) {
      toast.error("Nomor WhatsApp tidak valid");
      return;
    }

    // Call the payment handler with the confirmed customer info
    if (handlePayment) {
      handlePayment(pointsToUse, confirmedName, confirmedWhatsapp);
    } else {
      toast.error("Error: Payment handler not available");
      navigate("/pos");
    }
  };

  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <div className="container max-w-5xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Konfirmasi Pesanan</h1>
        <p className="text-gray-500">Tanggal: {format(new Date(), "dd MMMM yyyy, HH:mm")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Informasi Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRegisteredCustomer ? (
              <div className="space-y-2">
                <p><strong>Nama:</strong> {confirmedName}</p>
                <p><strong>WhatsApp:</strong> {confirmedWhatsapp}</p>
                <p><strong>Status:</strong> Pelanggan Terdaftar</p>
                {pointsToUse > 0 && (
                  <p><strong>Poin Digunakan:</strong> {pointsToUse} poin</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nama Pelanggan</Label>
                  <Input 
                    id="customerName" 
                    value={confirmedName} 
                    onChange={(e) => setConfirmedName(e.target.value)} 
                    placeholder="Masukkan nama pelanggan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">Nomor WhatsApp</Label>
                  <Input 
                    id="whatsappNumber" 
                    value={confirmedWhatsapp} 
                    onChange={(e) => setConfirmedWhatsapp(e.target.value)} 
                    placeholder="Contoh: 08123456789"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={20} />
              Metode Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as "cash" | "qris")}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                  <Receipt className="h-5 w-5" />
                  Tunai
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="qris" id="qris" />
                <Label htmlFor="qris" className="flex items-center gap-2 cursor-pointer">
                  <QrCode className="h-5 w-5" />
                  QRIS
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rincian Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">Rp {item.price.toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            
            {pointsToUse > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Poin Digunakan</span>
                <span>- Rp {(pointsToUse * 1000).toLocaleString('id-ID')}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total Pembayaran</span>
              <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/pos")}>
            Kembali
          </Button>
          <Button onClick={handleConfirmOrder} className="gap-2">
            Konfirmasi Pembayaran
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
