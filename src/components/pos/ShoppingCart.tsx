import { ShoppingCart as CartIcon, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

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
  onCheckout: () => void;
}

export const ShoppingCart = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}: ShoppingCartProps) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
        <div className="flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>
        <Button 
          className="w-full text-sm" 
          size="sm"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          Proses Pembayaran
        </Button>
      </div>
    </Card>
  );
};