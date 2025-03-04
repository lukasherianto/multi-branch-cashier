import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ProductForm } from "./forms/ProductForm";
import { CategoryForm } from "./forms/CategoryForm";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CategoryManagement } from "./CategoryManagement";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

const ProductManagement = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { pelakuUsaha } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!pelakuUsaha) return [];
      const { data } = await supabase
        .from('kategori_produk')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);
      return data || [];
    },
    enabled: !!pelakuUsaha
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleProductSubmit = async (values: any) => {
    // Product submission logic
  };

  const handleCategorySubmit = async (formData: { categoryName: string; description: string }) => {
    try {
      if (!pelakuUsaha) {
        toast({
          title: "Error",
          description: "Data pelaku usaha tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('kategori_produk')
        .insert({
          pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
          kategori_name: formData.categoryName,
          description: formData.description
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Kategori berhasil ditambahkan",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan kategori",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between space-y-2">
        <div className="md:w-1/3">
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <PlusCircle className="w-4 h-4 mr-2" />
                Tambah
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg p-0">
              <SheetHeader className="text-left p-6">
                <SheetTitle>Tambah Produk</SheetTitle>
              </SheetHeader>
              <Tabs defaultValue="products" className="m-4 space-y-4">
                <TabsList>
                  <TabsTrigger value="products">Produk</TabsTrigger>
                  <TabsTrigger value="categories">Kategori</TabsTrigger>
                </TabsList>
                <TabsContent value="products" className="space-y-4">
                  <ProductForm 
                    categories={categories || []}
                    onSubmit={handleProductSubmit}
                    isSubmitting={false}
                  />
                </TabsContent>
                <TabsContent value="categories" className="space-y-4">
                  <CategoryForm onSubmit={handleCategorySubmit} />
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
