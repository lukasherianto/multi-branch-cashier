
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/pos";
import { useToast } from "@/hooks/use-toast";

export interface ProductWithSelection extends CartItem {
  selected: boolean;
  produk_id: number;
}

export const useCentralProducts = (centralBranchId: string | null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<ProductWithSelection[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSelection[]>([]);
  const { toast } = useToast();

  // Fetch products from central branch
  useEffect(() => {
    const fetchCentralProducts = async () => {
      if (!centralBranchId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data: pelakuUsahaData } = await supabase
          .from("pelaku_usaha")
          .select("*")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (pelakuUsahaData) {
          const { data: productsData, error } = await supabase
            .from("produk")
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
            .eq("pelaku_usaha_id", pelakuUsahaData.pelaku_usaha_id)
            .eq("cabang_id", centralBranchId)
            .gt("stock", 0); // Only fetch products with stock > 0

          if (error) throw error;

          if (productsData) {
            const mappedProducts = productsData.map((product) => ({
              id: product.produk_id,
              produk_id: product.produk_id,
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

            setSelectedProducts(mappedProducts);
            setFilteredProducts(mappedProducts);
          }
        }
      } catch (error) {
        console.error("Error fetching central products:", error);
        toast({
          title: "Error",
          description: "Gagal memuat produk dari cabang pusat",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCentralProducts();
  }, [centralBranchId, toast]);

  // Handle search functionality
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(selectedProducts);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = selectedProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchLower)) ||
        (product.category && product.category.toLowerCase().includes(searchLower))
    );

    setFilteredProducts(filtered);
  };

  // Handle product selection
  const handleProductSelection = (productId: number, selected: boolean) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.produk_id === productId ? { ...product, selected } : product
      )
    );

    setFilteredProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.produk_id === productId ? { ...product, selected } : product
      )
    );
  };

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) return;

    // Find the product to check stock
    const product = selectedProducts.find(p => p.produk_id === productId);
    
    if (product && quantity > product.stock) {
      toast({
        title: "Warning",
        description: `Jumlah melebihi stok yang tersedia (${product.stock})`,
        variant: "destructive",
      });
      quantity = product.stock; // Cap at max stock
    }

    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.produk_id === productId ? { ...product, quantity } : product
      )
    );

    setFilteredProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.produk_id === productId ? { ...product, quantity } : product
      )
    );
  };

  return {
    selectedProducts,
    filteredProducts,
    isLoading,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    setSelectedProducts
  };
};
