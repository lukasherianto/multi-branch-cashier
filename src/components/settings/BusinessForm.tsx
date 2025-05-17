
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessFormHeader } from "./BusinessFormHeader";
import { BusinessFormSkeleton } from "./BusinessFormSkeleton";
import { WhatsAppInput } from "./WhatsAppInput";
import { LogoUpload } from "./LogoUpload";
import { SocialMediaInputs } from "./SocialMediaInputs";
import { PointsToggle } from "./PointsToggle";
import { useBusinessForm } from "./useBusinessForm";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";

export const BusinessForm = () => {
  const { user, pelakuUsaha } = useAuth();
  const {
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
    pelakuUsahaId,
    loadBusinessData
  } = useBusinessForm();

  // Reload after a successful save to refresh data throughout app
  useEffect(() => {
    if (user && !pelakuUsaha && !isLoading && !isSaving) {
      console.log("No pelakuUsaha data found, checking if we need to reload");
      // Attempt to reload after 2 seconds
      const timer = setTimeout(() => {
        console.log("Reloading business data");
        loadBusinessData();
        
        if (pelakuUsahaId) {
          toast.success("Data usaha berhasil dibuat. Memuat ulang data...");
          // Give Supabase time to process data before reload
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [pelakuUsahaId, user, pelakuUsaha, isLoading, isSaving]);

  if (isLoading) {
    return <BusinessFormSkeleton />;
  }

  return (
    <Card>
      <BusinessFormHeader />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <LogoUpload 
            logoUrl={logoUrl} 
            businessName={businessName}
            onLogoUploaded={setLogoUrl}
          />

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
          
          <SocialMediaInputs
            instagram={instagram}
            setInstagram={setInstagram}
            facebook={facebook}
            setFacebook={setFacebook}
          />
          
          <PointsToggle 
            pointsEnabled={pointsEnabled}
            onChange={setPointsEnabled}
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
