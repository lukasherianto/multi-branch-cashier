import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ProductList } from "@/components/pos/ProductList";
import { ProductManagement } from "@/components/pos/ProductManagement";
import { CategoryManagement } from "@/components/pos/CategoryManagement";

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
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
            member_price_1,
            member_price_2,
            stock,
            barcode,
            cost_price,
            unit,
            kategori_produk (
              kategori_name
            )
          `)
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

        if (error) throw error;

        if (productsData) {
          console.log('Products fetched:', productsData);
          const mappedProducts = productsData.map(product => ({
            id: product.produk_id,
            name: product.product_name,
            price: product.retail_price,
            member_price_1: product.member_price_1,
            member_price_2: product.member_price_2,
            quantity: 1,
            category: product.kategori_produk?.kategori_name,
            stock: product.stock,
            barcode: product.barcode,
            unit: product.unit,
            cost_price: product.cost_price
          }));
          setProducts(mappedProducts);
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
    console.log("Searching for:", searchTerm);
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm)) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProducts(filtered);

    if (searchTerm.length > 5 && filtered.length === 0) {
      toast({
        title: "Produk Tidak Ditemukan",
        description: "Tidak ada produk dengan barcode tersebut",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Produk</h2>
        <div className="flex gap-2">
          <CategoryManagement />
          <ProductManagement onSuccess={fetchProducts} />
        </div>
      </div>

      <ProductSearch onSearch={handleSearch} />

      <ProductList
        products={filteredProducts}
        onAddToCart={() => {}}
        isRegisteredCustomer={false}
        showStockAction={true}
        onRefresh={fetchProducts}
      />
    </div>
  );
};

export default Products;