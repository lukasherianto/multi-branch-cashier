
import { useState } from "react";
import { fetchUserPelakuUsaha } from "../api/employeeApi";

export const useBusinessProfile = () => {
  const [pelakuUsahaId, setPelakuUsahaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBusinessProfile = async (userId: string) => {
    try {
      console.log("Loading business profile...");
      const pelakuUsaha = await fetchUserPelakuUsaha(userId);

      if (!pelakuUsaha) {
        console.log("No pelaku usaha found, user needs to create business profile first");
        setError("Anda perlu membuat profil usaha terlebih dahulu");
        return null;
      }

      setPelakuUsahaId(pelakuUsaha.pelaku_usaha_id);
      return pelakuUsaha.pelaku_usaha_id;
    } catch (err: any) {
      console.error("Error loading business profile:", err);
      setError(err.message || "Gagal memuat profil usaha");
      return null;
    }
  };

  return {
    pelakuUsahaId,
    loadBusinessProfile,
    error
  };
};
