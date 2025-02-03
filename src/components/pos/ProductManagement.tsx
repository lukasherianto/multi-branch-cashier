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
import { ProductForm } from "./forms/ProductForm";

interface ProductManagementProps {
  onSuccess?: () => void;
}

export const ProductManagement = ({ onSuccess }: ProductManagementProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ kategori_id: number; kategori_name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error('Error fetching pelaku usaha:', pelakuUsahaError);
        return;
      }

      if (!pelakuUsahaData) {
        console.log('No pelaku_usaha found');
        return;
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('kategori_produk')
        .select('kategori_id, kategori_name')
        .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error in fetchCategories:', error);
    }
  };

  const handleSubmit = async (formData: {
    productName: string;
    selectedKategori: string;
    costPrice: string;
    retailPrice: string;
    memberPrice: string;
    stock: string;
    barcode: string;
    unit: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Anda belum login",
          variant: "destructive",
        });
        return;
      }

      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pelakuUsahaError) {
        throw pelakuUsahaError;
      }

      if (!pelakuUsahaData) {
        toast({
          title: "Error",
          description: "Data pelaku usaha tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      if (!formData.selectedKategori) {
        toast({
          title: "Error",
          description: "Silakan pilih kategori produk",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('produk')
        .insert({
          pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
          kategori_id: parseInt(formData.selectedKategori),
          product_name: formData.productName,
          cost_price: parseFloat(formData.costPrice),
          retail_price: parseFloat(formData.retailPrice),
          member_price: formData.memberPrice ? parseFloat(formData.memberPrice) : null,
          stock: parseInt(formData.stock),
          barcode: formData.barcode || null,
          unit: formData.unit,
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Produk berhasil ditambahkan",
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
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
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            Isi informasi produk dengan lengkap
          </DialogDescription>
        </DialogHeader>
        <ProductForm 
          categories={categories}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};