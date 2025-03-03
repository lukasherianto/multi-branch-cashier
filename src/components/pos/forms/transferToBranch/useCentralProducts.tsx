
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithSelection } from "@/types/pos";

export const useCentralProducts = (centralBranchId: number | null) => {
  const [products, setProducts] = useState<ProductWithSelection[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const { pelakuUsahaId } = useAuth();

  // Fetch products from central branch
  useEffect(() => {
    const fetchCentralProducts = async () => {
      if (!centralBranchId || !pelakuUsahaId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
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
          .eq('pelaku_usaha_id', pelakuUsahaId)
          .eq('cabang_id', centralBranchId)
          .gt('stock', 0); // Only products with stock > 0
          
        if (error) throw error;
        
        if (data) {
          const mappedProducts: ProductWithSelection[] = data.map(product => ({
            id: product.produk_id,
            name: product.product_name,
            price: product.retail_price,
            member_price_1: product.member_price_1,
            member_price_2: product.member_price_2,
            quantity: 1,
            category: product.kategori_produk?.kategori_name,
            stock: product.stock,
            barcode: product.barcode || "",
            unit: product.unit,
            cost_price: product.cost_price,
            cabang_id: product.cabang_id,
            selected: false
          }));
          
          setProducts(mappedProducts);
          setFilteredProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Error fetching central products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCentralProducts();
  }, [centralBranchId, pelakuUsahaId]);

  // Search products
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

  // Handle product selection
  const handleProductSelection = (productId: number, selected: boolean) => {
    const updatedProducts = filteredProducts.map(product => 
      product.id === productId ? { ...product, selected } : product
    );
    setFilteredProducts(updatedProducts);
  };

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
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
