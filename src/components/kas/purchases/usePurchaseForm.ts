
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { purchaseFormSchema, type PurchaseFormValues } from "./schema";

export interface Product {
  produk_id: number;
  product_name: string;
}

export const usePurchaseForm = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      produk_id: "",
      description: "",
      quantity: "",
      unit_price: "",
      payment_status: "0",
      jadwal_lunas: "",
      tanggal_dilunaskan: "",
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("produk")
        .select("produk_id, product_name");
      
      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      setProducts(data);
    };

    fetchProducts();
  }, []);

  const onSubmit = async (values: PurchaseFormValues) => {
    try {
      const totalPrice = parseFloat(values.quantity) * parseFloat(values.unit_price);

      const { error } = await supabase.from("pembelian").insert({
        produk_id: parseInt(values.produk_id),
        quantity: parseInt(values.quantity),
        unit_price: parseFloat(values.unit_price),
        total_price: totalPrice,
        payment_status: parseInt(values.payment_status),
        jadwal_lunas: values.jadwal_lunas || null,
        tanggal_dilunaskan: values.tanggal_dilunaskan || null,
        transaction_date: new Date(values.transaction_date).toISOString(),
        description: values.description || null,
        cabang_id: 1,
      });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Pembelian berhasil dicatat",
      });

      form.reset();
    } catch (error) {
      console.error("Error recording purchase:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat pembelian",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    products,
    onSubmit: form.handleSubmit(onSubmit),
    watchPaymentStatus: form.watch("payment_status"),
  };
};
