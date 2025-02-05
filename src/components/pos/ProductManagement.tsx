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
import { useNavigate } from "react-router-dom";

interface ProductManagementProps {
  onSuccess?: () => void;
}

export const ProductManagement = ({ onSuccess }: ProductManagementProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ kategori_id: number; kategori_name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchCategories = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Auth error or no user:', authError);
          navigate('/auth');
          return;
        }

        console.log('Authenticated user:', user.id);
        await fetchCategories(user.id);
      } catch (error) {
        console.error('Error in checkAuthAndFetchCategories:', error);
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat memuat data",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    checkAuthAndFetchCategories();
  }, [navigate, toast]);

  const fetchCategories = async (userId: string) => {
    try {
      console.log('Fetching pelaku usaha data for user:', userId);
      
      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error('Error fetching pelaku usaha:', pelakuUsahaError);
        throw pelakuUsahaError;
      }

      if (!pelakuUsahaData) {
        console.log('No pelaku_usaha found, redirecting to settings');
        toast({
          title: "Profil Usaha Belum Dibuat",
          description: "Silakan lengkapi profil usaha Anda terlebih dahulu",
          variant: "destructive",
        });
        navigate('/settings');
        return;
      }

      console.log('Fetching categories for pelaku usaha:', pelakuUsahaData.pelaku_usaha_id);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('kategori_produk')
        .select('kategori_id, kategori_name')
        .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }

      console.log('Categories fetched:', categoriesData);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data kategori",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (formData: {
    productName: string;
    selectedKategori: string;
    costPrice: string;
    retailPrice: string;
    memberPrice1: string;
    memberPrice2: string;
    stock: string;
    barcode: string;
    unit: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Error",
          description: "Anda belum login",
          variant: "destructive",
        });
        navigate('/auth');
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
          member_price_1: formData.memberPrice1 ? parseFloat(formData.memberPrice1) : null,
          member_price_2: formData.memberPrice2 ? parseFloat(formData.memberPrice2) : null,
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