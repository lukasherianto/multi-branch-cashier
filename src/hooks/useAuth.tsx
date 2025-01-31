import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("User tidak ditemukan, mengarahkan ke halaman auth");
        navigate('/auth');
        return;
      }

      console.log("User ditemukan:", user.id);
      
      const { data: pelakuUsahaData, error: pelakuUsahaError } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pelakuUsahaError) {
        console.error("Error mengambil data pelaku usaha:", pelakuUsahaError);
        throw pelakuUsahaError;
      }

      if (!pelakuUsahaData) {
        console.log("Profil usaha belum dibuat");
        toast({
          title: "Profil Usaha Belum Dibuat",
          description: "Silakan buat profil usaha Anda terlebih dahulu",
          variant: "destructive",
        });
        navigate('/settings');
        return;
      }

      console.log("Data pelaku usaha:", pelakuUsahaData);
      setPelakuUsaha(pelakuUsahaData);

      const { data: cabangData, error: cabangError } = await supabase
        .from('cabang')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
        .maybeSingle();

      if (cabangError) {
        console.error("Error mengambil data cabang:", cabangError);
        throw cabangError;
      }

      if (!cabangData) {
        console.log("Belum ada cabang yang dibuat");
        toast({
          title: "Cabang Belum Dibuat",
          description: "Silakan buat cabang terlebih dahulu",
          variant: "destructive",
        });
        navigate('/branches');
        return;
      }

      console.log("Data cabang:", cabangData);
      setCabang(cabangData);

    } catch (error: any) {
      console.error('Error checking auth:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat memuat data. Silakan coba lagi.",
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { pelakuUsaha, cabang };
};