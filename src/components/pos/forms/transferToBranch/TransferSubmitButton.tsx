
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

interface TransferSubmitButtonProps {
  isSubmitting: boolean;
}

export function TransferSubmitButton({ isSubmitting }: TransferSubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : (
        <>
          Transfer Stok <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
