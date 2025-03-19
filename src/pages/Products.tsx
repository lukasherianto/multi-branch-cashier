
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ProductList } from "@/components/pos/ProductList";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { ProductFormModal } from "@/components/pos/forms/ProductFormModal";
import { useAuth } from "@/hooks/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/products";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Products = () => {
  const { toast } = useToast();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { cabangList, selectedCabangId, setSelectedCabangId, pelakuUsaha, userRole } = useAuth();
  const isCashier = userRole === 'kasir';
  
  const { 
    filteredProducts, 
    handleSearch, 
    fetchProducts,
    loading,
    error,
    initialLoadComplete
  } = useProducts();

  useEffect(() => {
    // Load products on component mount
    if (pelakuUsaha && !initialLoadComplete) {
      refreshProducts();
    }
  }, [pelakuUsaha]);

  // Refresh data products
  const refreshProducts = () => {
    console.log("Refreshing products for branch:", selectedCabangId);
    fetchProducts(selectedCabangId).then(products => {
      console.log(`Refreshed ${products.length} products`);
      toast({
        title: "Data diperbarui",
        description: `${products.length} produk berhasil dimuat`,
      });
    }).catch(err => {
      console.error("Error refreshing products:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memperbarui data produk",
      });
    });
  };

  // Sort branches so the headquarters (lowest ID) appears first
  const sortedBranches = [...cabangList].sort((a, b) => a.cabang_id - b.cabang_id);
  // The first branch (after sorting) is considered the headquarters
  const headquartersId = sortedBranches.length > 0 ? sortedBranches[0].cabang_id : null;

  if (!pelakuUsaha) {
    return (
      <div className="text-center py-8 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Produk</h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Perhatian</AlertTitle>
          <AlertDescription>
            Silakan lengkapi profil usaha Anda terlebih dahulu di halaman Pengaturan sebelum dapat mengelola produk.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Produk</h2>
        <div className="flex gap-4">
          <Button variant="outline" onClick={refreshProducts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
          {!isCashier && (
            <Button onClick={() => setShowAddProduct(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          )}
        </div>
      </div>

      <ProductSearch onSearch={handleSearch} />

      {loading && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data produk...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <p>Error saat memuat data: {error.message}</p>
            <p className="mt-2">Silakan coba refresh halaman atau periksa koneksi internet Anda.</p>
          </AlertDescription>
        </Alert>
      )}

      {!loading && !error && filteredProducts && filteredProducts.length === 0 && (
        <div className="p-8 text-center bg-gray-50 rounded-md border border-gray-200">
          <p className="text-gray-500">Tidak ada produk yang ditemukan.</p>
          {!isCashier && (
            <p className="text-gray-500 mt-2">Tambahkan produk baru dengan mengklik tombol "Tambah Produk"</p>
          )}
        </div>
      )}

      {!loading && !error && filteredProducts && filteredProducts.length > 0 && (
        <ProductList
          products={filteredProducts}
          onAddToCart={() => {}}
          isRegisteredCustomer={false}
          memberType="none"
          showStockAction={!isCashier}
          onRefresh={() => fetchProducts(selectedCabangId)}
        />
      )}

      {!isCashier && (
        <ProductFormModal 
          open={showAddProduct} 
          onOpenChange={setShowAddProduct}
          onSuccess={() => fetchProducts(selectedCabangId)}
        />
      )}
    </div>
  );
};

export default Products;
