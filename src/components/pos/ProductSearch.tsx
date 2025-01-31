import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductSearchProps {
  onSearch: (value: string) => void;
}

export const ProductSearch = ({ onSearch }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [lastKeyTime, setLastKeyTime] = useState(Date.now());

  useEffect(() => {
    // Jika ada input barcode yang terkumpul, jalankan pencarian
    if (barcodeBuffer) {
      const timeoutId = setTimeout(() => {
        console.log("Searching by barcode:", barcodeBuffer);
        onSearch(barcodeBuffer);
        setBarcodeBuffer("");
      }, 100); // Delay kecil untuk memastikan seluruh karakter barcode sudah terkumpul

      return () => clearTimeout(timeoutId);
    }
  }, [barcodeBuffer, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Kirim nilai pencarian untuk pencarian manual
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastKeyTime;

    // Scanner barcode biasanya mengirim karakter dengan sangat cepat (< 50ms)
    if (timeDiff < 50) {
      e.preventDefault();
      setBarcodeBuffer(prev => prev + e.key);
    } else {
      setBarcodeBuffer("");
    }

    setLastKeyTime(currentTime);
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
      <Input
        className="pl-10 text-sm"
        placeholder="Cari produk atau scan barcode..."
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};