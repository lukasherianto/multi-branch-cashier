
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { purchaseFormSchema, type PurchaseFormData } from "./types";
import { usePurchaseForm } from "./usePurchaseForm";
import { PurchaseFormFields } from "./PurchaseFormFields";

export const PurchaseForm = () => {
  const navigate = useNavigate();
  const { onSubmit } = usePurchaseForm();
  
  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      quantity: 0,
      unit_price: 0,
      is_price_change: false,
      price_notes: '',
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
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

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .single();

      if (pelakuUsahaData) {
        const { data } = await supabase
          .from('cabang')
          .select('*')
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);
        return data;
      }
      return [];
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Tambah Pembelian Baru</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PurchaseFormFields 
            form={form} 
            categories={categories || []} 
            branches={branches || []} 
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/purchase")}
            >
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
