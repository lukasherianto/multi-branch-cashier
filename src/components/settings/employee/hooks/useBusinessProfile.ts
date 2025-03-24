
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchUserPelakuUsaha } from "../api/employeeApi";

export const useBusinessProfile = () => {
  const { toast } = useToast();
  const [pelakuUsahaId, setPelakuUsahaId] = useState<number | null>(null);
  const [businessName, setBusinessName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadBusinessProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const businessData = await fetchUserPelakuUsaha(userId);
      
      if (!businessData) {
        setError("Data usaha tidak ditemukan");
        toast({
          title: "Error",
          description: "Data usaha tidak ditemukan",
          variant: "destructive",
        });
        return null;
      }
      
      setPelakuUsahaId(businessData.pelaku_usaha_id);
      // Handle possibly missing business_name safely
      setBusinessName(businessData.business_name || "");
      
      return businessData.pelaku_usaha_id;
    } catch (err: any) {
      console.error("Error loading business profile:", err);
      setError(err.message || "Gagal memuat data usaha");
      toast({
        title: "Error",
        description: "Gagal memuat data usaha",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pelakuUsahaId,
    businessName,
    loadBusinessProfile,
    isLoading,
    error
  };
};
