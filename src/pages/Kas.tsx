
import { DollarSign } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { CashForm, CashFormValues } from "@/components/kas/CashForm";
import { useCashOperations } from "@/hooks/kas/useCashOperations";

const Kas = () => {
  const { toast } = useToast();
  const { selectedCabangId } = useAuth();
  const cashInFormRef = useRef<HTMLFormElement>(null);
  const cashOutFormRef = useRef<HTMLFormElement>(null);
  
  const { handleCashIn, handleCashOut } = useCashOperations(selectedCabangId);

  useEffect(() => {
    if (!selectedCabangId) {
      toast({
        title: "Perhatian",
        description: "Silakan pilih cabang terlebih dahulu",
        variant: "destructive",
      });
    }
  }, [selectedCabangId, toast]);

  const onCashInSubmit = async (values: CashFormValues) => {
    const result = await handleCashIn(values);
    if (result.success && cashInFormRef.current) {
      cashInFormRef.current.reset();
    }
  };

  const onCashOutSubmit = async (values: CashFormValues) => {
    const result = await handleCashOut(values);
    if (result.success && cashOutFormRef.current) {
      cashOutFormRef.current.reset();
    }
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-6 h-6 text-mint-600" />
        <h1 className="text-xl font-semibold">Kas</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CashForm 
          type="masuk" 
          onSubmit={onCashInSubmit} 
        />
        <CashForm 
          type="keluar" 
          onSubmit={onCashOutSubmit} 
        />
      </div>
    </div>
  );
};

export default Kas;
