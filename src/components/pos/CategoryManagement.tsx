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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CategoryForm } from "./forms/CategoryForm";
import { CategoryList } from "./CategoryList";

export const CategoryManagement = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleSubmit = async ({ categoryName, description }: { categoryName: string; description: string }) => {
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
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan kategori",
        variant: "destructive",
      });
    }
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
          <CategoryForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>

      <CategoryList categories={categories} />
    </div>
  );
};