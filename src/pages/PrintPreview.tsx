
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReceiptDisplay } from "@/components/receipt/ReceiptDisplay";
import { ReceiptActions } from "@/components/receipt/ReceiptActions";
import { useReceipt } from "@/hooks/useReceipt";
import { TransactionItem } from "@/utils/receiptUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Define interface for business details
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
  const { pelakuUsaha } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  
  const { 
    items, 
    total, 
    pointsUsed, 
    pointsEarned, 
    businessName, 
    branchName,
    customerName,
    whatsappNumber,
    paymentMethod,
    transactionId
  } = location.state || {};
  
  // Initialize receipt data early to ensure hooks order is consistent
  const receiptData = {
    items: items || [],
    total: total || 0,
    pointsUsed: pointsUsed || 0,
    pointsEarned: pointsEarned || 0,
    businessName: businessName || (pelakuUsaha?.business_name || ""),
    branchName: branchName || "",
    customerName: customerName || null,
    whatsappNumber: whatsappNumber || null,
    paymentMethod: paymentMethod || null,
    transactionId: transactionId || null,
    logoUrl: businessDetails?.logo_url || null,
    instagramUrl: businessDetails?.instagram_url || null,
    facebookUrl: businessDetails?.facebook_url || null,
    businessWhatsapp: businessDetails?.contact_whatsapp || null,
    pointsEnabled: businessDetails?.points_enabled || false
  };
  
  // Use the receipt hook for functionality (before useEffect)
  const { invoiceNumber, handlePrint, handleWhatsApp, handleBack, handleDownloadPDF } = useReceipt(receiptData);
  
  useEffect(() => {
    // If we already have the pelaku_usaha details from auth context, use that
    if (pelakuUsaha) {
      setBusinessDetails(pelakuUsaha);
      setIsLoading(false);
    } else {
      // Otherwise fetch the business details
      fetchBusinessDetails();
    }
  }, [pelakuUsaha]);
  
  const fetchBusinessDetails = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('pelaku_usaha')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setBusinessDetails(data as BusinessDetails);
        }
      }
    } catch (error) {
      console.error("Error fetching business details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Redirect to POS page if necessary data is missing
  if (!items || !total) {
    navigate('/pos');
    return null;
  }

  // Show loading while fetching business details
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-mint-600" />
      </div>
    );
  }

  // Only show points information if the feature is enabled
  const showPointsInfo = businessDetails?.points_enabled && (pointsUsed > 0 || pointsEarned > 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ReceiptDisplay 
        businessName={businessName}
        branchName={branchName}
        invoiceNumber={invoiceNumber}
        customerName={customerName}
        whatsappNumber={whatsappNumber}
        items={items as TransactionItem[]}
        pointsUsed={showPointsInfo ? pointsUsed : 0}
        total={total}
        paymentMethod={paymentMethod}
        pointsEarned={showPointsInfo ? pointsEarned : 0}
        logoUrl={businessDetails?.logo_url}
        instagramUrl={businessDetails?.instagram_url}
        facebookUrl={businessDetails?.facebook_url}
        businessWhatsapp={businessDetails?.contact_whatsapp}
        showPointsInfo={showPointsInfo}
      />
      
      <div className="mt-6">
        <ReceiptActions
          onPrint={handlePrint}
          onWhatsApp={handleWhatsApp}
          onBack={handleBack}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    </div>
  );
};

export default PrintPreview;
