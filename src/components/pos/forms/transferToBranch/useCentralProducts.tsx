
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/types/pos";

export interface ProductWithSelection extends CartItem {
  selected: boolean;
}

export const useCentralProducts = (centralBranchId: number | null) => {
  const [products, setProducts] = useState<ProductWithSelection[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch products from the central branch
  useEffect(() => {
    const fetchProducts = async () => {
      if (!centralBranchId) {
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data: pelakuUsahaData } = await supabase
          .from('pelaku_usaha')
          .select('*')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (pelakuUsahaData) {
          let query = supabase
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
            .eq('cabang_id', centralBranchId)
            .gt('stock', 0); // Only fetch products with stock > 0

          const { data: productsData, error } = await query;

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
              selected: false
            }));
            
            setProducts(mappedProducts);
            setFilteredProducts(mappedProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal mengambil data produk dari pusat",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [centralBranchId, toast]);

  // Handle search functionality
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchLower) || 
      (product.barcode && product.barcode.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower))
    );
    
    setFilteredProducts(filtered);
  };

  // Product selection handling
  const handleProductSelection = (productId: number, selected: boolean) => {
    setFilteredProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, selected } 
          : product
      )
    );
    
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, selected } 
          : product
      )
    );
  };

  // Quantity change handling
  const handleQuantityChange = (productId: number, quantity: number) => {
    setFilteredProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, quantity: Math.min(quantity, product.stock) } 
          : product
      )
    );
    
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, quantity: Math.min(quantity, product.stock) } 
          : product
      )
    );
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
