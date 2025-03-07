
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchUserPelakuUsaha } from "../api/employeeApi";

export const useBusinessProfile = () => {
  const { toast } = useToast();
  const [pelakuUsahaId, setPelakuUsahaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBusinessProfile = async (userId: string): Promise<number | null> => {
    try {
      console.log("Loading business profile for user:", userId);
      const businessData = await fetchUserPelakuUsaha(userId);
      
      if (!businessData || !businessData.pelaku_usaha_id) {
        console.error("No business profile found");
        setError("Data usaha tidak ditemukan");
        toast({
          title: "Error",
          description: "Data usaha tidak ditemukan. Buat data usaha terlebih dahulu di tab Data Usaha.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Business profile loaded:", businessData);
      setPelakuUsahaId(businessData.pelaku_usaha_id);
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
    }
  };

  return {
    pelakuUsahaId,
    loadBusinessProfile,
    error
  };
};
