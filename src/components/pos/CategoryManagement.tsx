import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CategoryManagement = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Array<{ kategori_name: string; description: string | null }>>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .single();

      if (pelakuUsahaData) {
        const { data: categoriesData } = await supabase
          .from('kategori_produk')
          .select('kategori_name, description')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

        if (categoriesData) {
          setCategories(categoriesData);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .single();

      if (!pelakuUsahaData) {
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
          pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
          kategori_name: categoryName,
          description: description || null,
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Kategori berhasil ditambahkan",
      });

      setIsOpen(false);
      resetForm();
      fetchCategories(); // Refresh daftar kategori
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan kategori",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setDescription("");
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nama Kategori</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Simpan
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Daftar Kategori</h3>
        <div className="border rounded-lg divide-y">
          {categories.map((category, index) => (
            <div key={index} className="p-3">
              <h4 className="font-medium">{category.kategori_name}</h4>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="p-3 text-gray-500">Belum ada kategori</p>
          )}
        </div>
      </div>
    </div>
  );
};