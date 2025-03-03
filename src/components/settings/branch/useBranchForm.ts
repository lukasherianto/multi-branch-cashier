
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useBranchForm = () => {
  const { toast } = useToast();
  const { pelakuUsaha } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const validateWhatsappNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (!cleanNumber.match(/^(08|628)/)) return false;
    if (cleanNumber.length < 10 || cleanNumber.length > 13) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!branchName.trim()) {
      toast({
        title: "Error",
        description: "Nama cabang tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (whatsapp && !validateWhatsappNumber(whatsapp)) {
      toast({
        title: "Error",
        description: "Format nomor WhatsApp tidak valid",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Menggunakan pelaku_usaha_id dari context Auth daripada query database lagi
      if (!pelakuUsaha) {
        throw new Error("Data pelaku usaha tidak ditemukan");
      }

      console.log("Creating new branch for pelaku_usaha_id:", pelakuUsaha.pelaku_usaha_id);
      const { error: insertError, data } = await supabase
        .from('cabang')
        .insert({
          pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
          branch_name: branchName,
          address: address || null,
          contact_whatsapp: whatsapp || null,
        })
        .select();

      if (insertError) throw insertError;

      console.log("Branch successfully added:", data);

      toast({
        title: "Berhasil",
        description: "Cabang baru berhasil ditambahkan",
      });

      // Reset form
      setBranchName("");
      setAddress("");
      setWhatsapp("");
      
      // Tambahkan refresh halaman untuk memastikan data terupdate
      setTimeout(() => {
        window.location.href = "/branches";
      }, 1500);
      
    } catch (error) {
      console.error("Error saving branch data:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan cabang baru",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    branchName,
    setBranchName,
    address,
    setAddress,
    whatsapp,
    setWhatsapp,
    isSaving,
    handleSubmit,
  };
};
