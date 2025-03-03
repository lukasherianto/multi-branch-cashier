
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ProductList } from "@/components/pos/ProductList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductFormModal } from "@/components/pos/forms/ProductFormModal";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/products";

const Products = () => {
  const { toast } = useToast();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { cabangList, selectedCabangId, setSelectedCabangId } = useAuth();
  const { 
    filteredProducts, 
    handleSearch, 
    fetchProducts 
  } = useProducts();

  useEffect(() => {
    fetchProducts(selectedCabangId);
  }, [selectedCabangId]);

  // Sort branches so the headquarters (lowest ID) appears first
  const sortedBranches = [...cabangList].sort((a, b) => a.cabang_id - b.cabang_id);
  // The first branch (after sorting) is considered the headquarters
  const headquartersId = sortedBranches.length > 0 ? sortedBranches[0].cabang_id : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Produk</h2>
        <div className="flex gap-4">
          {cabangList.length > 1 && (
            <Select
              value={selectedCabangId ? selectedCabangId.toString() : "0"}
              onValueChange={(value) => setSelectedCabangId(value === "0" ? null : parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Semua Cabang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Semua Cabang</SelectItem>
                {sortedBranches.map((branch) => (
                  <SelectItem 
                    key={branch.cabang_id} 
                    value={branch.cabang_id.toString()}
                  >
                    {branch.cabang_id === headquartersId 
                      ? `${branch.branch_name} (Pusat)` 
                      : branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => setShowAddProduct(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <ProductSearch onSearch={handleSearch} />

      <ProductList
        products={filteredProducts}
        onAddToCart={() => {}}
        isRegisteredCustomer={false}
        memberType="none"
        showStockAction={true}
        onRefresh={() => fetchProducts(selectedCabangId)}
      />

      <ProductFormModal 
        open={showAddProduct} 
        onOpenChange={setShowAddProduct}
        onSuccess={() => fetchProducts(selectedCabangId)}
      />
    </div>
  );
};

export default Products;
