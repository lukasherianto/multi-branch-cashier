import { useState } from "react";
import { User, CalendarIcon, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { WhatsAppInput } from "@/components/settings/WhatsAppInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [showCalendar, setShowCalendar] = useState(false);

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
          tanggal_lahir: birthDate,
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <WhatsAppInput
        value={whatsappNumber}
        onChange={setWhatsappNumber}
        onCheck={handleCheckCustomer}
        onSave={handleSaveCustomer}
      />
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Nama Pelanggan"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="pl-10 text-sm"
        />
      </div>
      <div className="relative">
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal pl-10 relative"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          {birthDate ? format(birthDate, 'dd MMMM yyyy', { locale: id }) : 'Pilih Tanggal Lahir'}
        </Button>
        {showCalendar && (
          <div className="absolute z-10 bg-white border rounded-md shadow-lg mt-1">
            <Calendar
              mode="single"
              selected={birthDate}
              onSelect={(date) => {
                setBirthDate(date);
                setShowCalendar(false);
              }}
              locale={id}
              initialFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};