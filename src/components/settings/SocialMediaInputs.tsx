
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Facebook } from "lucide-react";

interface SocialMediaInputsProps {
  instagram: string;
  setInstagram: (value: string) => void;
  facebook: string;
  setFacebook: (value: string) => void;
}

export const SocialMediaInputs = ({ 
  instagram, 
  setInstagram, 
  facebook, 
  setFacebook 
}: SocialMediaInputsProps) => {
  return (
    <>
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
    </>
  );
};
