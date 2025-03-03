
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LogoUploadProps {
  logoUrl: string | null;
  businessName: string;
  onLogoUploaded: (url: string) => void;
}

export const LogoUpload = ({ logoUrl, businessName, onLogoUploaded }: LogoUploadProps) => {
  const { toast } = useToast();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran gambar maksimal 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingLogo(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `business_logos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business_assets')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('business_assets')
        .getPublicUrl(filePath);
        
      onLogoUploaded(publicUrl);
      
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

  return (
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
  );
};
