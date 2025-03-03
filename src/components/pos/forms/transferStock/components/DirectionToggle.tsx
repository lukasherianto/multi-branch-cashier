
import React from "react";
import { Switch } from "@/components/ui/switch";
import { ArrowUpDown } from "lucide-react";

interface DirectionToggleProps {
  fromCentralToBranch: boolean;
  toggleDirection: () => void;
}

export const DirectionToggle = ({ 
  fromCentralToBranch, 
  toggleDirection 
}: DirectionToggleProps) => {
  return (
    <div className="flex items-center justify-end mb-4">
      <span className="text-sm mr-2">
        {fromCentralToBranch ? "Pusat ke Cabang" : "Cabang ke Pusat"}
      </span>
      <div className="flex items-center space-x-2">
        <Switch
          checked={!fromCentralToBranch}
          onCheckedChange={toggleDirection}
          aria-label="Toggle transfer direction"
        />
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};
