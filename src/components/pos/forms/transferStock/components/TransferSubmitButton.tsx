
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { TransferStockFormValues } from "../schema";

interface TransferSubmitButtonProps {
  isSubmitting: boolean;
  form: UseFormReturn<TransferStockFormValues>;
  selectedProductsCount: number;
}

export const TransferSubmitButton = ({ 
  isSubmitting, 
  form,
  selectedProductsCount 
}: TransferSubmitButtonProps) => {
  const formIsValid = form.formState.isValid && selectedProductsCount > 0;
  
  return (
    <div className="flex flex-col space-y-2">
      <Button
        type="submit"
        disabled={isSubmitting || !formIsValid}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses Transfer...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Transfer Stok ({selectedProductsCount} produk)
          </>
        )}
      </Button>
      
      {!formIsValid && (
        <p className="text-sm text-muted-foreground text-center">
          Pilih cabang asal, cabang tujuan, dan minimal 1 produk
        </p>
      )}
    </div>
  );
};
