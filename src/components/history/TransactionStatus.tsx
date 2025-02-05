
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle2 } from "lucide-react";

interface TransactionStatusProps {
  status: number;
  onStatusChange: (currentStatus: number) => void;
}

export const TransactionStatus = ({ status, onStatusChange }: TransactionStatusProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs px-2"
      onClick={() => onStatusChange(status)}
    >
      <Badge 
        variant={status === 1 ? "success" : "destructive"}
        className="flex items-center gap-1"
      >
        {status === 1 ? (
          <>
            <CheckCircle2 className="w-3 h-3" />
            Lunas
          </>
        ) : (
          <>
            <Ban className="w-3 h-3" />
            Hutang
          </>
        )}
      </Badge>
    </Button>
  );
};
