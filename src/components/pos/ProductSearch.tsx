import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductManagement } from "./ProductManagement";

interface ProductSearchProps {
  onSearch: (value: string) => void;
}

export const ProductSearch = ({ onSearch }: ProductSearchProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          className="pl-10 text-sm"
          placeholder="Cari produk..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <ProductManagement />
    </div>
  );
};