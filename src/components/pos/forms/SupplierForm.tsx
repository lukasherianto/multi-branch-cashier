import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SupplierFormProps {
  onSubmit: (formData: {
    namaUsaha: string;
    alamat: string;
    whatsapp: string;
  }) => void;
  isSubmitting: boolean;
}

export const SupplierForm = ({ onSubmit, isSubmitting }: SupplierFormProps) => {
  const [namaUsaha, setNamaUsaha] = useState("");
  const [alamat, setAlamat] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      namaUsaha,
      alamat,
      whatsapp,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="namaUsaha">Nama Usaha</Label>
        <Input
          id="namaUsaha"
          value={namaUsaha}
          onChange={(e) => setNamaUsaha(e.target.value)}
          placeholder="Masukkan nama usaha supplier"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
        <Input
          id="whatsapp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Masukkan nomor WhatsApp"
          type="tel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alamat">Alamat</Label>
        <Input
          id="alamat"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="Masukkan alamat supplier"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
};