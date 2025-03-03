
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';

export interface TransferSubmitButtonProps {
  isSubmitting: boolean;
  selectedProductsCount: number;
}

export const TransferSubmitButton = ({ 
  isSubmitting, 
  selectedProductsCount 
}: TransferSubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full md:w-auto"
      disabled={isSubmitting || selectedProductsCount === 0}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Memproses...
        </>
      ) : (
        <>
          <Send className="h-4 w-4 mr-2" />
          Transfer {selectedProductsCount} Produk
        </>
      )}
    </Button>
  );
};
