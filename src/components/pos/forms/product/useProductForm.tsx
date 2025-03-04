import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { productFormSchema, ProductFormValues } from "./schema";
import { useAuth } from "@/hooks/auth";

export function useProductForm(onSuccess?: () => void, onOpenChange?: (open: boolean) => void) {
  const { toast } = useToast();
  const { cabang } = useAuth();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      stock: 0,
      cost_price: 0,
      retail_price: 0,
      member_price_1: 0,
      member_price_2: 0,
      unit: 'Pcs',
      cabang_id: cabang?.cabang_id,
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (pelakuUsahaData) {
        const { data } = await supabase
          .from('kategori_produk')
          .select('*')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);
        return data;
      }
      return [];
    },
  });

  async function onSubmit(values: ProductFormValues) {
    try {
      console.log('Form values:', values);
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!pelakuUsahaData) throw new Error("Data pelaku usaha tidak ditemukan");

      // Get the main branch if cabang_id is not provided
      let branchId = values.cabang_id;
      if (!branchId) {
        const { data: mainBranch } = await supabase
          .from('cabang')
          .select('cabang_id')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
          .order('cabang_id', { ascending: true })
          .limit(1)
          .single();
          
        if (mainBranch) {
          branchId = mainBranch.cabang_id;
        } else {
          throw new Error("Cabang tidak ditemukan");
        }
      }

      const { error } = await supabase
        .from('produk')
        .insert({
          pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
          kategori_id: parseInt(values.kategori_id),
          product_name: values.product_name,
          barcode: values.barcode || null,
          cost_price: values.cost_price,
          retail_price: values.retail_price,
          member_price_1: values.member_price_1,
          member_price_2: values.member_price_2,
          stock: values.stock,
          unit: values.unit,
          cabang_id: branchId,
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `Data produk "${values.product_name}" telah berhasil disimpan`,
        duration: 3000,
      });
      
      form.reset();
      if (onOpenChange) onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Gagal menambahkan produk",
      });
    }
  }

  return {
    form,
    categories,
    onSubmit
  };
}
