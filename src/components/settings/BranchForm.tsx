import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, GitBranchPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppInput } from "./WhatsAppInput";

export const BranchForm = () => {
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
      const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', parseInt(user.id))
        .single();

      if (pelakuUsahaError) throw pelakuUsahaError;
      if (!pelakuUsaha) throw new Error("Pelaku usaha not found");

      console.log("Creating new branch for pelaku_usaha_id:", pelakuUsaha.pelaku_usaha_id);
      const { error: insertError } = await supabase
        .from('cabang')
        .insert({
          pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
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

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="branchName">Nama Cabang</Label>
            <Input
              id="branchName"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="Masukkan nama cabang"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masukkan alamat cabang"
            />
          </div>
          <WhatsAppInput 
            value={whatsapp}
            onChange={setWhatsapp}
          />
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <GitBranchPlus className="mr-2 h-4 w-4" />
                Tambah Cabang
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};