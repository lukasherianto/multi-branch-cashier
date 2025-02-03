import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductFormProps {
  categories: Array<{ kategori_id: number; kategori_name: string }>;
  onSubmit: (formData: {
    productName: string;
    selectedKategori: string;
    costPrice: string;
    retailPrice: string;
    memberPrice: string;
    stock: string;
    barcode: string;
    unit: string;
  }) => void;
  isSubmitting: boolean;
}

export const ProductForm = ({ categories, onSubmit, isSubmitting }: ProductFormProps) => {
  const [productName, setProductName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [memberPrice, setMemberPrice] = useState("");
  const [stock, setStock] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [barcode, setBarcode] = useState("");
  const [unit, setUnit] = useState("Pcs");

  const units = ["Pcs", "Buah", "Unit", "Kg", "Gram", "Meter", "Liter"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      productName,
      selectedKategori,
      costPrice,
      retailPrice,
      memberPrice,
      stock,
      barcode,
      unit,
    });
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="productName">Nama Produk</Label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            placeholder="Masukkan nama produk"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode">Kode Barcode</Label>
          <Input
            id="barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Masukkan kode barcode (opsional)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select value={selectedKategori} onValueChange={setSelectedKategori} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori produk" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem 
                  key={category.kategori_id} 
                  value={category.kategori_id.toString()}
                >
                  {category.kategori_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Satuan</Label>
          <Select value={unit} onValueChange={setUnit} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih satuan produk" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unitOption) => (
                <SelectItem key={unitOption} value={unitOption}>
                  {unitOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPrice">Harga Modal</Label>
          <Input
            id="costPrice"
            type="number"
            min="0"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            required
            placeholder="Masukkan harga modal"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retailPrice">Harga Jual</Label>
          <Input
            id="retailPrice"
            type="number"
            min="0"
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
            required
            placeholder="Masukkan harga jual"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memberPrice">Harga Member</Label>
          <Input
            id="memberPrice"
            type="number"
            min="0"
            value={memberPrice}
            onChange={(e) => setMemberPrice(e.target.value)}
            placeholder="Masukkan harga member (opsional)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stok</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            placeholder="Masukkan jumlah stok"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </ScrollArea>
  );
};