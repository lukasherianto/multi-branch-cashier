import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReceiptDisplay } from "@/components/receipt/ReceiptDisplay";
import { ReceiptActions } from "@/components/receipt/ReceiptActions";
import { useReceipt } from "@/hooks/useReceipt";
import { TransactionItem } from "@/utils/receiptUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface BusinessDetails {
  business_name: string;
  contact_whatsapp?: string | null;
  logo_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  points_enabled?: boolean;
}

const PrintPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const receiptData = {
    items: location.state?.items || [],
    total: location.state?.total || 0,
    pointsUsed: location.state?.pointsUsed || 0,
    pointsEarned: location.state?.pointsEarned || 0,
    businessName: location.state?.businessName || "",
    branchName: location.state?.branchName || "",
    customerName: location.state?.customerName || null,
    whatsappNumber: location.state?.whatsappNumber || null,
    paymentMethod: location.state?.paymentMethod || null,
    transactionId: location.state?.transactionId || null,
    logoUrl: null,
    instagramUrl: null,
    facebookUrl: null,
    businessWhatsapp: null,
  };
  
  const { 
    invoiceNumber, 
    handlePrint, 
    handleWhatsApp, 
    handleBack,
    handleDownloadPDF 
  } = useReceipt(receiptData);
  
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);
  const [facebookUrl, setFacebookUrl] = useState<string | null>(null);
  const [businessWhatsapp, setBusinessWhatsapp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pointsEnabled, setPointsEnabled] = useState(true);

  useEffect(() => {
    if (!location.state) {
      navigate('/pos');
      return;
    }

    loadBusinessDetails();
  }, [location, navigate]);

  const loadBusinessDetails = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('pelaku_usaha')
        .select('logo_url, instagram_url, facebook_url, contact_whatsapp, points_enabled')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error loading business details:", error);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        setLogoUrl(data.logo_url);
        setInstagramUrl(data.instagram_url);
        setFacebookUrl(data.facebook_url);
        setBusinessWhatsapp(data.contact_whatsapp);
        setPointsEnabled(data.points_enabled || false);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error in loadBusinessDetails:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-mint-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <ReceiptActions
          onPrint={handlePrint}
          onWhatsApp={handleWhatsApp}
          onBack={handleBack}
          onDownloadPDF={handleDownloadPDF}
        />
        
        <ReceiptDisplay
          businessName={receiptData.businessName}
          branchName={receiptData.branchName}
          invoiceNumber={invoiceNumber}
          customerName={receiptData.customerName}
          whatsappNumber={receiptData.whatsappNumber}
          items={receiptData.items}
          pointsUsed={receiptData.pointsUsed}
          total={receiptData.total}
          paymentMethod={receiptData.paymentMethod}
          pointsEarned={receiptData.pointsEarned}
          logoUrl={logoUrl}
          instagramUrl={instagramUrl}
          facebookUrl={facebookUrl}
          businessWhatsapp={businessWhatsapp}
          showPointsInfo={pointsEnabled}
        />
      </div>
    </div>
  );
};

export default PrintPreview;
