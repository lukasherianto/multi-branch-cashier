import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useBranchForm = () => {
  const { toast } = useToast();
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log("Getting pelaku_usaha_id for user:", user.id);
      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pelakuUsahaError) throw pelakuUsahaError;
      if (!pelakuUsahaData) throw new Error("Pelaku usaha not found");

      console.log("Creating new branch for pelaku_usaha_id:", pelakuUsahaData.pelaku_usaha_id);
      const { error: insertError } = await supabase
        .from('cabang')
        .insert({
          pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
          branch_name: branchName,
          address: address || null,
          contact_whatsapp: whatsapp || null,
        });

      if (insertError) throw insertError;

      toast({
        title: "Berhasil",
        description: "Cabang baru berhasil ditambahkan",
      });

      // Reset form
      setBranchName("");
      setAddress("");
      setWhatsapp("");
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