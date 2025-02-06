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
import { SupplierForm } from "./forms/SupplierForm";
import { useNavigate } from "react-router-dom";

interface SupplierManagementProps {
  onSuccess?: () => void;
}

export const SupplierManagement = ({ onSuccess }: SupplierManagementProps) => {
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
    namaUsaha: string;
    selectedKategori: string;
    alamat: string;
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

      const { error } = await supabase
        .from('supplier')
        .insert({
          pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
          kategori_id: parseInt(formData.selectedKategori),
          nama_usaha: formData.namaUsaha,
          alamat: formData.alamat || null,
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Supplier berhasil ditambahkan",
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan supplier",
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
          Tambah Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Supplier Baru</DialogTitle>
          <DialogDescription>
            Isi informasi supplier dengan lengkap
          </DialogDescription>
        </DialogHeader>
        <SupplierForm 
          categories={categories}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};