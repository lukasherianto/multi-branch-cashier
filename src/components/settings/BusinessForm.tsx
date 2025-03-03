
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Instagram, Facebook } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessFormHeader } from "./BusinessFormHeader";
import { BusinessFormSkeleton } from "./BusinessFormSkeleton";
import { WhatsAppInput } from "./WhatsAppInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define interface for business data to include the new fields
interface BusinessData {
  pelaku_usaha_id: number;
  user_id: string;
  business_name: string;
  contact_whatsapp: string;
  created_at: string;
  updated_at: string;
  logo_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
}

export const BusinessForm = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [pelakuUsahaId, setPelakuUsahaId] = useState<number | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast({
        title: "Error",
        description: "Ukuran gambar maksimal 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingLogo(true);
      
      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `business_logos/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('business_assets')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business_assets')
        .getPublicUrl(filePath);
        
      setLogoUrl(publicUrl);
      
      toast({
        title: "Berhasil",
        description: "Logo berhasil diunggah",
      });
      
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Gagal mengunggah logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
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

      // Prepare business data with social media
      const businessData = {
        business_name: businessName,
        contact_whatsapp: whatsapp,
        instagram_url: instagram,
        facebook_url: facebook,
        logo_url: logoUrl,
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
        const { error: insertError } = await supabase
          .from('pelaku_usaha')
          .insert({
            user_id: user.id,
            ...businessData,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Berhasil",
        description: "Data usaha berhasil diperbarui",
      });
      
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload Section */}
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-2 border-2 border-gray-200">
                <AvatarImage src={logoUrl || ''} />
                <AvatarFallback className="text-xl">{businessName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                className="hidden"
                accept="image/*"
              />
              <Button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={uploadingLogo}
                className="mt-2"
              >
                {uploadingLogo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-1">Max 2MB, format JPG/PNG</p>
            </div>
          </div>

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
          
          {/* Social Media Fields */}
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Username Instagram (tanpa @)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </Label>
            <Input
              id="facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="Username Facebook atau URL halaman"
            />
          </div>
          
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
