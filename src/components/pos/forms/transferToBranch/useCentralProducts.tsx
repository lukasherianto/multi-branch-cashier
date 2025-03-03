
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CartItem, ProductWithSelection } from "@/types/pos";

export const useCentralProducts = (centralBranchId: number) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithSelection[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCentralProducts();
  }, [centralBranchId]);

  const loadCentralProducts = async () => {
    try {
      setLoading(true);
      
      if (!centralBranchId) {
        toast({
          title: "Error",
          description: "No central branch ID specified"
        });
        return;
      }
      
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
            unit,
            cost_price,
            cabang_id,
            kategori_produk (
              kategori_name
            )
          `)
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
          .eq('cabang_id', centralBranchId);

        if (error) throw error;

        if (productsData) {
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
            cost_price: product.cost_price,
            cabang_id: product.cabang_id,
            selected: false,
            produk_id: product.produk_id
          }));
          
          setProducts(mappedProducts);
          setFilteredProducts(mappedProducts);
        }
      }
    } catch (error) {
      console.error('Error fetching central products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengambil data produk pusat"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
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
  };

  const handleProductSelection = (productId: number, selected: boolean) => {
    const updatedProducts = filteredProducts.map(product => 
      product.id === productId ? { ...product, selected } : product
    );
    setFilteredProducts(updatedProducts);
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) return; // Don't allow quantities below 1
    
    const updatedProducts = filteredProducts.map(product => 
      product.id === productId ? { ...product, quantity } : product
    );
    setFilteredProducts(updatedProducts);
  };

  return {
    products,
    filteredProducts,
    loading,
    handleSearch,
    handleProductSelection,
    handleQuantityChange
  };
};
