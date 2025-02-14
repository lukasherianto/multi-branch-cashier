
import { ShoppingCart as CartIcon, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: number, change: number) => void;
  onRemoveItem: (itemId: number) => void;
  onCheckout: (pointsToUse: number) => void;
  customerPoints?: number;
}

export const ShoppingCart = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  customerPoints = 0
}: ShoppingCartProps) => {
  const [pointsToUse, setPointsToUse] = useState(0);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handlePointsInput = (value: string) => {
    const points = parseInt(value) || 0;
    if (points > customerPoints) {
      toast.error("Poin yang digunakan tidak boleh melebihi poin yang tersedia");
      setPointsToUse(customerPoints);
      return;
    }
    if (points * 1000 > total) {
      toast.error("Poin yang digunakan tidak boleh melebihi total transaksi");
      setPointsToUse(Math.floor(total / 1000));
      return;
    }
    setPointsToUse(points);
  };

  const finalTotal = total - (pointsToUse * 1000);

  return (
    <Card className="w-[320px] flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center space-x-2">
          <CartIcon className="h-4 w-4 text-mint-600" />
          <h3 className="font-semibold text-sm">Keranjang</h3>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Produk</TableHead>
              <TableHead className="text-xs text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="py-2">
                  <div>
                    <div className="font-medium text-xs">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      Rp {item.price.toLocaleString('id-ID')}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-xs">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-right">
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border-t p-3 space-y-3">
        <div className="space-y-2">
          {customerPoints > 0 && (
            <>
              <div className="flex justify-between text-xs">
                <span>Poin Tersedia</span>
                <span>{customerPoints} (Rp {(customerPoints * 1000).toLocaleString('id-ID')})</span>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Gunakan Poin"
                  className="text-xs"
                  value={pointsToUse}
                  onChange={(e) => handlePointsInput(e.target.value)}
                  min={0}
                  max={Math.min(customerPoints, Math.floor(total / 1000))}
                />
                <span className="text-xs text-gray-500">Poin</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
          {pointsToUse > 0 && (
            <>
              <div className="flex justify-between text-xs text-red-500">
                <span>Poin Digunakan</span>
                <span>- Rp {(pointsToUse * 1000).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Akhir</span>
                <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
              </div>
            </>
          )}
        </div>
        <Button 
          className="w-full text-sm" 
          size="sm"
          onClick={() => onCheckout(pointsToUse)}
          disabled={items.length === 0}
        >
          Proses Pembayaran
        </Button>
      </div>
    </Card>
  );
};
