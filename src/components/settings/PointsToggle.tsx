
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

interface PointsToggleProps {
  pointsEnabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const PointsToggle = ({ pointsEnabled, onChange }: PointsToggleProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Award className="h-5 w-5 text-mint-600" />
          Fitur Poin Pelanggan
        </CardTitle>
        <CardDescription>
          Aktifkan fitur poin untuk memberikan rewards kepada pelanggan setia Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch 
            id="points-mode" 
            checked={pointsEnabled} 
            onCheckedChange={onChange} 
          />
          <Label htmlFor="points-mode">
            {pointsEnabled ? "Fitur poin aktif" : "Fitur poin nonaktif"}
          </Label>
        </div>
        
        {pointsEnabled && (
          <p className="mt-2 text-sm text-gray-500">
            Pelanggan akan mendapatkan 1 poin untuk setiap Rp 1.000 pembelanjaan
          </p>
        )}
      </CardContent>
    </Card>
  );
};
