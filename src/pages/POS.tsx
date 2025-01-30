import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const POS = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Produk Contoh",
      price: 25000,
      quantity: 1
    }
  ]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("User tidak ditemukan, mengarahkan ke halaman auth");
        navigate('/auth');
        return;
      }

      console.log("User ditemukan:", user.id);
      
      // Get pelaku_usaha data
      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (pelakuUsahaError) {
        console.error("Error mengambil data pelaku usaha:", pelakuUsahaError);
        throw pelakuUsahaError;
      }

      console.log("Data pelaku usaha:", pelakuUsahaData);
      setPelakuUsaha(pelakuUsahaData);

      // Get first cabang for this pelaku_usaha
      const { data: cabangData, error: cabangError } = await supabase
        .from('cabang')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
        .single();

      if (cabangError) {
        console.error("Error mengambil data cabang:", cabangError);
        throw cabangError;
      }

      console.log("Data cabang:", cabangData);
      setCabang(cabangData);

    } catch (error: any) {
      console.error('Error checking auth:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat memuat data. Silakan coba lagi.",
      });
    }
  };

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

  const handlePayment = async () => {
    if (!pelakuUsaha || !cabang) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Data pelaku usaha atau cabang tidak tersedia.",
      });
      return;
    }

    try {
      // Process each item in the cart
      for (const item of cartItems) {
        const { error } = await supabase
          .from('transaksi')
          .insert({
            cabang_id: cabang.cabang_id,
            produk_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            transaction_date: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Clear cart after successful transaction
      setCartItems([]);
      
      toast({
        title: "Pembayaran Berhasil",
        description: `Total pembayaran: Rp ${total.toLocaleString('id-ID')}`,
      });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        variant: "destructive",
        title: "Gagal Memproses Pembayaran",
        description: error.message || "Terjadi kesalahan saat memproses pembayaran.",
      });
    }
  };

  const sampleProducts = [
    { id: 1, name: "Produk 1", price: 25000, stock: 100, category: "Kategori A" },
    { id: 2, name: "Produk 2", price: 30000, stock: 75, category: "Kategori B" },
    { id: 3, name: "Produk 3", price: 15000, stock: 50, category: "Kategori A" },
    { id: 4, name: "Produk 4", price: 40000, stock: 25, category: "Kategori C" },
    { id: 5, name: "Produk 5", price: 35000, stock: 60, category: "Kategori B" },
  ];

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      {/* Product Search and Table Section */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Kasir</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            className="pl-10 text-sm"
            placeholder="Cari produk..."
          />
        </div>

        <Card className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nama Produk</TableHead>
                <TableHead className="text-xs">Kategori</TableHead>
                <TableHead className="text-xs text-right">Harga</TableHead>
                <TableHead className="text-xs text-right">Stok</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleProducts.map((product) => (
                <TableRow key={product.id} className="text-sm">
                  <TableCell className="py-2 text-xs">{product.name}</TableCell>
                  <TableCell className="py-2 text-xs">{product.category}</TableCell>
                  <TableCell className="py-2 text-xs text-right">
                    Rp {product.price.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-right">{product.stock}</TableCell>
                  <TableCell className="py-2 text-xs text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs px-2 py-1 h-7 w-16"
                      onClick={() => {
                        setCartItems(items => {
                          const existingItem = items.find(item => item.id === product.id);
                          if (existingItem) {
                            return items.map(item =>
                              item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                            );
                          }
                          return [...items, { ...product, quantity: 1 }];
                        });
                      }}
                    >
                      Buy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Cart Section */}
      <Card className="w-[320px] flex flex-col">
        <div className="p-3 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4 text-mint-600" />
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
              {cartItems.map((item) => (
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
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => removeItem(item.id)}
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
            onClick={handlePayment}
            disabled={cartItems.length === 0}
          >
            Proses Pembayaran
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default POS;
