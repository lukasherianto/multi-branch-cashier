
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OrderSummaryProps {
  customerName: string | null;
  whatsappNumber: string | null;
  isRegisteredCustomer: boolean;
  memberType: string | null;
  memberPoints: number | null;
  cartItems: any[];
  pointsToUse: number;
  finalTotal: number;
  paymentMethod: "cash" | "qris";
  setPaymentMethod: (method: "cash" | "qris") => void;
  pointsEnabled?: boolean;
}

export const OrderSummary = ({
  customerName,
  whatsappNumber,
  isRegisteredCustomer,
  memberType,
  memberPoints,
  cartItems,
  pointsToUse,
  finalTotal,
  paymentMethod,
  setPaymentMethod,
  pointsEnabled = true
}: OrderSummaryProps) => {
  return (
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

      {pointsEnabled && pointsToUse > 0 && (
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
  );
};
