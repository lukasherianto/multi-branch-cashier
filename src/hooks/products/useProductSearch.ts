
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/types/pos";

export const useProductSearch = (products: CartItem[]) => {
  const { toast } = useToast();
  const [filteredProducts, setFilteredProducts] = useState<CartItem[]>(products);

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

    // Show notification if no products are found
    if (searchTerm.length > 5 && filtered.length === 0) {
      toast({
        title: "Produk Tidak Ditemukan",
        description: "Tidak ada produk dengan kata kunci tersebut",
        variant: "destructive",
      });
    }

    return filtered;
  };

  return { 
    filteredProducts, 
    setFilteredProducts,
    handleSearch 
  };
};
