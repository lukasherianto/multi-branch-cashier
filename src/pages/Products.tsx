import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ProductList } from "@/components/pos/ProductList";

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

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
            stock: product.stock
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

  const handleSearch = (searchTerm: string) => {
    // Implement product search logic here
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Produk</h2>
      </div>

      <ProductSearch onSearch={handleSearch} />

      <ProductList
        products={products}
        onAddToCart={() => {}}
        isRegisteredCustomer={false}
      />
    </div>
  );
};

export default Products;