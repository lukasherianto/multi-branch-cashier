
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { TransferToBranchFormValues } from "./schema";
import { Loader2 } from "lucide-react";

interface TransferSubmitButtonProps {
  isSubmitting: boolean;
  form: UseFormReturn<TransferToBranchFormValues>;
  selectedProductsCount: number;
}

export function TransferSubmitButton({ 
  isSubmitting, 
  form,
  selectedProductsCount
}: TransferSubmitButtonProps) {
  return (
    <div className="flex justify-end">
      <Button 
        type="submit" 
        disabled={
          isSubmitting || 
          !form.formState.isValid || 
          selectedProductsCount === 0
        }
        className="w-full md:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          `Transfer Produk (${selectedProductsCount})`
        )}
      </Button>
    </div>
  );
}
