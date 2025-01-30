import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessFormHeader } from "./BusinessFormHeader";
import { BusinessFormSkeleton } from "./BusinessFormSkeleton";
import { WhatsAppInput } from "./WhatsAppInput";

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
        
        const { data: businessData, error } = await supabase
          .from('pelaku_usaha')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        console.log("Business data loaded:", businessData);

        if (businessData) {
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

  const validateWhatsappNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (!cleanNumber.match(/^(08|628)/)) return false;
    if (cleanNumber.length < 10 || cleanNumber.length > 13) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim()) {
      toast({
        title: "Error",
        description: "Nama usaha tidak boleh kosong",
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

      console.log("Saving business data for user:", user.id);

      if (pelakuUsahaId) {
        console.log("Updating existing business:", pelakuUsahaId);
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
        console.log("Creating new business for user:", user.id);
        const { error: insertError } = await supabase
          .from('pelaku_usaha')
          .insert({
            user_id: user.id,
            business_name: businessName,
            contact_whatsapp: whatsapp,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Berhasil",
        description: "Data usaha berhasil diperbarui",
      });
      
      // Reload data to get the new pelaku_usaha_id if it was just created
      loadBusinessData();
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
    return <BusinessFormSkeleton />;
  }

  return (
    <Card>
      <BusinessFormHeader />
      <CardContent>
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
              "Simpan Perubahan"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};