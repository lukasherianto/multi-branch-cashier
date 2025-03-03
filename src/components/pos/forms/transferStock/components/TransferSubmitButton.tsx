
import React from "react";
import { Button } from "@/components/ui/button";
import { TransferStockFormValues } from "../schema";
import { UseFormReturn } from "react-hook-form";

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
  const isDisabled = isSubmitting || 
    !form.getValues("cabang_id_from") || 
    !form.getValues("cabang_id_to") || 
    selectedProductsCount === 0;

  return (
    <Button 
      type="submit" 
      disabled={isDisabled}
      className="w-full md:w-auto"
    >
      {isSubmitting ? "Memproses..." : "Transfer Stok"}
    </Button>
  );
};
