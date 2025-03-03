
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

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { cabangList, selectedCabangId, setSelectedCabangId } = useAuth();

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
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
            cost_price,
            unit,
            cabang_id,
            kategori_produk (
              kategori_name
            )
          `)
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

        // Filter by selected branch if one is selected
        if (selectedCabangId) {
          query = query.eq('cabang_id', selectedCabangId);
        }

        const { data: productsData, error } = await query;

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
            cost_price: product.cost_price,
            cabang_id: product.cabang_id
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
        description: "Gagal mengambil data produk",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCabangId]);

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
        description: "Tidak ada produk dengan kata kunci tersebut",
        variant: "destructive",
      });
    }
  };

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
        onRefresh={fetchProducts}
      />

      <ProductFormModal 
        open={showAddProduct} 
        onOpenChange={setShowAddProduct}
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default Products;
