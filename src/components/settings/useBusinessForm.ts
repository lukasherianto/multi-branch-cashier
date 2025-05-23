
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessData {
  pelaku_usaha_id: number;
  user_id: string;
  business_name: string;
  contact_whatsapp: string;
  created_at: string;
  updated_at: string;
  logo_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  points_enabled?: boolean;
}

export const useBusinessForm = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [pelakuUsahaId, setPelakuUsahaId] = useState<number | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [pointsEnabled, setPointsEnabled] = useState(false);

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
          const data = businessData as BusinessData;
          setPelakuUsahaId(data.pelaku_usaha_id);
          setBusinessName(data.business_name || '');
          setWhatsapp(data.contact_whatsapp || '');
          setInstagram(data.instagram_url || '');
          setFacebook(data.facebook_url || '');
          setLogoUrl(data.logo_url || null);
          setPointsEnabled(data.points_enabled || false);
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

      const businessData = {
        business_name: businessName,
        contact_whatsapp: whatsapp,
        instagram_url: instagram,
        facebook_url: facebook,
        logo_url: logoUrl,
        points_enabled: pointsEnabled,
        updated_at: new Date().toISOString(),
      };

      if (pelakuUsahaId) {
        console.log("Updating existing business:", pelakuUsahaId);
        const { error: updateError } = await supabase
          .from('pelaku_usaha')
          .update(businessData)
          .eq('pelaku_usaha_id', pelakuUsahaId);

        if (updateError) throw updateError;
      } else {
        console.log("Creating new business for user:", user.id);
        const { data: newBusiness, error: insertError } = await supabase
          .from('pelaku_usaha')
          .insert({
            user_id: user.id,
            ...businessData,
          })
          .select('*')
          .single();

        if (insertError) throw insertError;
        
        if (newBusiness) {
          setPelakuUsahaId(newBusiness.pelaku_usaha_id);
          
          // Also update profiles table with pelaku_usaha_id
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              pelaku_usaha_id: newBusiness.pelaku_usaha_id,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              updated_at: new Date().toISOString()
            });
            
          if (profileUpdateError) {
            console.error("Error updating profile:", profileUpdateError);
          }
        }
      }

      toast({
        title: "Berhasil",
        description: "Data usaha berhasil diperbarui",
      });
      
      await loadBusinessData();
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

  return {
    isLoading,
    isSaving,
    businessName,
    setBusinessName,
    whatsapp,
    setWhatsapp,
    instagram,
    setInstagram,
    facebook,
    setFacebook,
    logoUrl,
    setLogoUrl,
    pointsEnabled,
    setPointsEnabled,
    handleSubmit,
    validateWhatsappNumber,
    pelakuUsahaId,
    loadBusinessData
  };
};
