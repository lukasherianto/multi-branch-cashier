
import { Phone, Check, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface WhatsAppInputProps {
  value: string;
  onChange: (value: string) => void;
  onCheck?: () => void;
  onSave?: (() => void) | null;
}

export const WhatsAppInput = ({ value, onChange, onCheck, onSave }: WhatsAppInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="whatsapp" className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        Nomor WhatsApp
      </Label>
      <div className="flex gap-2">
        <Input
          id="whatsapp"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Contoh: 08123456789"
          type="tel"
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={onCheck}
          className="shrink-0"
        >
          <Check className="h-4 w-4" />
        </Button>
        {onSave && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={onSave}
            className="shrink-0"
          >
            <Save className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Format: 08xx atau 628xx (opsional)
      </p>
    </div>
  );
};
