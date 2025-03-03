
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

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
          <span className="animate-spin mr-2">◌</span>
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
