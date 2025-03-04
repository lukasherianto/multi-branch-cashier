import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ProductForm } from "./forms/ProductForm";
import { CategoryForm } from "./forms/CategoryForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CategoryManagement } from "./CategoryManagement";
import { useAuth } from "@/hooks/auth";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const ProductManagement = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

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
                  <ProductForm />
                </TabsContent>
                <TabsContent value="categories" className="space-y-4">
                  <CategoryForm />
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
