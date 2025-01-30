import { useState } from "react";
import { User, CalendarIcon, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppInput } from "@/components/settings/WhatsAppInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CustomerInfoProps {
  whatsappNumber: string;
  setWhatsappNumber: (value: string) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  birthDate: Date | null;
  setBirthDate: (value: Date | null) => void;
}

export const CustomerInfo = ({
  whatsappNumber,
  setWhatsappNumber,
  customerName,
  setCustomerName,
  birthDate,
  setBirthDate,
}: CustomerInfoProps) => {
  const { toast } = useToast();

  const handleCheckCustomer = async () => {
    if (whatsappNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nomor WhatsApp tidak valid",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pelanggan')
        .select('nama, tanggal_lahir')
        .eq('whatsapp', whatsappNumber)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCustomerName(data.nama);
        setBirthDate(data.tanggal_lahir ? new Date(data.tanggal_lahir) : null);
        toast({
          title: "Data Pelanggan Ditemukan",
          description: `Selamat datang kembali, ${data.nama}!`,
        });
      } else {
        setCustomerName("");
        setBirthDate(null);
        toast({
          title: "Pelanggan Baru",
          description: "Silakan lengkapi data pelanggan",
        });
      }
    } catch (error: any) {
      console.error('Error fetching customer data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengambil data pelanggan",
      });
    }
  };

  const handleSaveCustomer = async () => {
    if (whatsappNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nomor WhatsApp tidak valid",
      });
      return;
    }

    if (!customerName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nama pelanggan harus diisi",
      });
      return;
    }

    try {
      const { data: pelakuUsaha } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .single();

      if (!pelakuUsaha) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Data pelaku usaha tidak ditemukan",
        });
        return;
      }

      const { error } = await supabase
        .from('pelanggan')
        .insert({
          pelaku_usaha_id: pelakuUsaha.pelaku_usaha_id,
          nama: customerName,
          whatsapp: whatsappNumber,
          tanggal_lahir: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Data pelanggan berhasil disimpan",
      });
    } catch (error: any) {
      console.error('Error saving customer data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyimpan data pelanggan",
      });
    }
  };

  return (
    <div className="space-y-4">
      <WhatsAppInput
        value={whatsappNumber}
        onChange={setWhatsappNumber}
        onCheck={handleCheckCustomer}
        onSave={handleSaveCustomer}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nama Pelanggan
          </Label>
          <Input
            id="customerName"
            placeholder="Nama Pelanggan"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Tanggal Lahir
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate ? format(birthDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setBirthDate(e.target.value ? new Date(e.target.value) : null)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};