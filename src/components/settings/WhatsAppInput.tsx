import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WhatsAppInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const WhatsAppInput = ({ value, onChange }: WhatsAppInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="whatsapp" className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        Nomor WhatsApp
      </Label>
      <Input
        id="whatsapp"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Contoh: 08123456789"
        type="tel"
      />
      <p className="text-sm text-gray-500">
        Format: 08xx atau 628xx (opsional)
      </p>
    </div>
  );
};