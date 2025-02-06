import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SupplierFormProps {
  categories: Array<{ kategori_id: number; kategori_name: string }>;
  onSubmit: (formData: {
    namaUsaha: string;
    selectedKategori: string;
    alamat: string;
  }) => void;
  isSubmitting: boolean;
}

export const SupplierForm = ({ categories, onSubmit, isSubmitting }: SupplierFormProps) => {
  const [namaUsaha, setNamaUsaha] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [alamat, setAlamat] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      namaUsaha,
      selectedKategori,
      alamat,
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
        <Label htmlFor="kategori">Kategori</Label>
        <Select value={selectedKategori} onValueChange={setSelectedKategori} required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.kategori_id} value={category.kategori_id.toString()}>
                {category.kategori_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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