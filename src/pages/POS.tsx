import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CustomerInfo } from "@/components/pos/CustomerInfo";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ProductList } from "@/components/pos/ProductList";
import { ShoppingCart } from "@/components/pos/ShoppingCart";

interface CartItem {
  id: number;
  name: string;
  price: number;
  member_price?: number | null;
  quantity: number;
  category?: string;
  stock: number;
}

const POS = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isRegisteredCustomer, setIsRegisteredCustomer] = useState(false);
  const [products, setProducts] = useState<CartItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    checkAuth();
    fetchProducts();
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
      
      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error("Error mengambil data pelaku usaha:", pelakuUsahaError);
        throw pelakuUsahaError;
      }

      if (!pelakuUsahaData) {
        console.log("Profil usaha belum dibuat");
        toast({
          title: "Profil Usaha Belum Dibuat",
          description: "Silakan buat profil usaha Anda terlebih dahulu",
          variant: "destructive",
        });
        navigate('/settings');
        return;
      }

      console.log("Data pelaku usaha:", pelakuUsahaData);
      setPelakuUsaha(pelakuUsahaData);

      const { data: cabangData, error: cabangError } = await supabase
        .from('cabang')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
        .maybeSingle();

      if (cabangError) {
        console.error("Error mengambil data cabang:", cabangError);
        throw cabangError;
      }

      if (!cabangData) {
        console.log("Belum ada cabang yang dibuat");
        toast({
          title: "Cabang Belum Dibuat",
          description: "Silakan buat cabang terlebih dahulu",
          variant: "destructive",
        });
        navigate('/branches');
        return;
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

  const fetchProducts = async () => {
    try {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (pelakuUsahaData) {
        const { data: productsData, error } = await supabase
          .from('produk')
          .select(`
            produk_id,
            product_name,
            retail_price,
            member_price,
            stock,
            kategori_produk (
              kategori_name
            )
          `)
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

        if (error) throw error;

        if (productsData) {
          setProducts(productsData.map(product => ({
            id: product.produk_id,
            name: product.product_name,
            price: product.retail_price,
            member_price: product.member_price,
            quantity: 1,
            category: product.kategori_produk?.kategori_name,
            stock: product.stock || 0
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengambil data produk",
      });
    }
  };

  const updateQuantity = (itemId: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const handlePayment = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Keranjang Kosong",
        description: "Tambahkan produk ke keranjang terlebih dahulu",
      });
      return;
    }

    navigate('/print-preview', {
      state: {
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        businessName: pelakuUsaha?.business_name,
        branchName: cabang?.branch_name
      }
    });
  };

  const addToCart = (product: CartItem) => {
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
  };

  const handleSearch = (searchTerm: string) => {
    // Implement product search logic here
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Kasir</h2>
        </div>

        <CustomerInfo
          whatsappNumber={whatsappNumber}
          setWhatsappNumber={setWhatsappNumber}
          customerName={customerName}
          setCustomerName={setCustomerName}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          onCustomerFound={() => setIsRegisteredCustomer(true)}
          onNewCustomer={() => setIsRegisteredCustomer(false)}
        />

        <ProductSearch onSearch={handleSearch} />

        <ProductList
          products={products}
          onAddToCart={addToCart}
          isRegisteredCustomer={isRegisteredCustomer}
        />
      </div>

      <ShoppingCart
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handlePayment}
      />
    </div>
  );
};

export default POS;