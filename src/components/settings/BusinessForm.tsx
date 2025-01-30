import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const BusinessForm = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [pelakuUsahaId, setPelakuUsahaId] = useState<number | null>(null);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("Loading business data for user:", user);
        const numericUserId = parseInt(user.id);
        
        const { data: businessData, error } = await supabase
          .from('pelaku_usaha')
          .select('*')
          .eq('user_id', numericUserId)
          .single();

        if (error) throw error;

        if (businessData) {
          console.log("Business data loaded:", businessData);
          setPelakuUsahaId(businessData.pelaku_usaha_id);
          setBusinessName(businessData.business_name || '');
          setWhatsapp(businessData.contact_whatsapp || '');
        }
      }
    } catch (error) {
      console.error("Error loading business data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data usaha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const numericUserId = parseInt(user.id);

      if (pelakuUsahaId) {
        // Update existing business
        const { error: updateError } = await supabase
          .from('pelaku_usaha')
          .update({
            business_name: businessName,
            contact_whatsapp: whatsapp,
            updated_at: new Date().toISOString(),
          })
          .eq('pelaku_usaha_id', pelakuUsahaId);

        if (updateError) throw updateError;
      } else {
        // Create new business
        const { error: insertError } = await supabase
          .from('pelaku_usaha')
          .insert({
            user_id: numericUserId,
            business_name: businessName,
            contact_whatsapp: whatsapp,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Berhasil",
        description: "Data usaha berhasil diperbarui",
      });
    } catch (error) {
      console.error("Error saving business data:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data usaha",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Data Pelaku Usaha</h3>
        <p className="text-sm text-gray-500">
          Kelola informasi usaha Anda
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Nama Usaha</Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Masukkan nama usaha"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Masukkan nomor WhatsApp"
          />
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </form>
    </div>
  );
};