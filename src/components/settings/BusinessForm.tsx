
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
import { useBusinessForm } from "./useBusinessForm";

export const BusinessForm = () => {
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
    handleSubmit
  } = useBusinessForm();

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
