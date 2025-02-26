
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CategoryForm } from "./forms/CategoryForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface CategoryManagementProps {
  onSuccess?: () => void;
}

export const CategoryManagement = ({ onSuccess }: CategoryManagementProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ kategori_id: number; kategori_name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (pelakuUsahaData) {
        const { data: categoriesData } = await supabase
          .from('kategori_produk')
          .select('kategori_id, kategori_name')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

        if (categoriesData) {
          console.log('Fetched categories:', categoriesData);
          setCategories(categoriesData);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data kategori",
        variant: "destructive",
      });
    }
  };

  // Tambahkan useEffect untuk memanggil fetchCategories saat komponen dimount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (formData: { categoryName: string }) => {
    setIsSubmitting(true);
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
          kategori_name: formData.categoryName,
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Kategori berhasil ditambahkan",
      });

      fetchCategories();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan kategori",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          <DialogDescription>
            Isi informasi kategori dengan lengkap
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <CategoryForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          <Separator className="my-4" />
          
          <div>
            <h4 className="mb-4 text-sm font-medium">Daftar Kategori</h4>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              {categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.kategori_id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <span className="text-sm">{category.kategori_name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada kategori yang ditambahkan
                </p>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
