
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CashFormValues } from "@/components/kas/CashForm";

export const useCashOperations = (selectedBranchId: number | null) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCashTransaction = async (
    values: CashFormValues, 
    transactionType: "masuk" | "keluar"
  ) => {
    if (!selectedBranchId) {
      toast({
        title: "Error",
        description: "Silakan pilih cabang terlebih dahulu",
        variant: "destructive",
      });
      return { success: false };
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Submitting cash ${transactionType}:`, values);
      
      const { error } = await supabase.from("kas").insert({
        amount: parseFloat(values.amount),
        transaction_type: transactionType,
        description: values.description || null,
        transaction_date: new Date(values.transaction_date).toISOString(),
        cabang_id: selectedBranchId,
      });

      if (error) {
        console.error(`Error recording cash ${transactionType}:`, error);
        throw error;
      }

      toast({
        title: "Sukses",
        description: `Uang ${transactionType} berhasil dicatat`,
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Error recording cash ${transactionType}:`, error);
      toast({
        title: "Error",
        description: `Gagal mencatat uang ${transactionType}: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCashIn = async (values: CashFormValues) => {
    return handleCashTransaction(values, "masuk");
  };

  const handleCashOut = async (values: CashFormValues) => {
    return handleCashTransaction(values, "keluar");
  };

  return {
    handleCashIn,
    handleCashOut,
    isSubmitting
  };
};
