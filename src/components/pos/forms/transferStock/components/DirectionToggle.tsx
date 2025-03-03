
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

interface DirectionToggleProps {
  fromCentralToBranch: boolean;
  toggleDirection: () => void;
}

export const DirectionToggle = ({ fromCentralToBranch, toggleDirection }: DirectionToggleProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
      <div>
        <h3 className="font-medium">Arah Transfer:</h3>
        <p className="text-sm text-muted-foreground">
          {fromCentralToBranch 
            ? "Dari Pusat ke Cabang" 
            : "Dari Cabang ke Pusat"}
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleDirection}
        className="flex items-center gap-2"
      >
        <ArrowLeftRight className="h-4 w-4" />
        Ubah Arah
      </Button>
    </div>
  );
};
