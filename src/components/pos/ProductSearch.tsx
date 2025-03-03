
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductSearchProps {
  onSearch: (value: string) => void;
}

export const ProductSearch = ({ onSearch }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Send search value to parent component
    onSearch(value);
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
      <Input
        className="pl-10 text-sm"
        placeholder="Cari produk berdasarkan nama..."
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
};
