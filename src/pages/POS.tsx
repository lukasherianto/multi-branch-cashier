import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";

const POS = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Produk Contoh",
      price: 25000,
      quantity: 1
    }
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      {/* Product Search Section */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Kasir</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Cari produk..."
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <Card
              key={index}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-3" />
              <h3 className="font-medium">Produk {index + 1}</h3>
              <p className="text-sm text-gray-600">Rp 25.000</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <Card className="w-[400px] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-5 w-5 text-mint-600" />
            <h3 className="font-semibold text-lg">Keranjang</h3>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        Rp {item.price.toLocaleString('id-ID')}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="border-t p-6 space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <Button className="w-full" size="lg">
            Proses Pembayaran
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default POS;