
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, MessageSquare, ArrowLeft, FileDown } from "lucide-react";
import { ReceiptData } from "@/utils/receiptUtils";

interface ReceiptActionsProps {
  onPrint: () => void;
  onWhatsApp: () => void;
  onBack: () => void;
  onDownloadPDF: () => void;
}

export const ReceiptActions: React.FC<ReceiptActionsProps> = ({
  onPrint,
  onWhatsApp,
  onBack,
  onDownloadPDF
}) => {
  return (
    <>
      <div className="flex gap-4 justify-center print:hidden flex-wrap">
        <Button onClick={onPrint} className="w-40">
          <Printer className="mr-2 h-4 w-4" />
          Cetak Struk
        </Button>
        <Button onClick={onWhatsApp} className="w-40">
          <MessageSquare className="mr-2 h-4 w-4" />
          Kirim WhatsApp
        </Button>
        <Button onClick={onDownloadPDF} className="w-40">
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      
      <div className="print:hidden text-center mt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke POS
        </Button>
      </div>
    </>
  );
};
