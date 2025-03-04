
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFilterOptionsProps {
  onFilterChange: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  currentFilter: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const ProductFilterOptions: React.FC<ProductFilterOptionsProps> = ({ 
  onFilterChange, 
  currentFilter 
}) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm text-muted-foreground">Tampilkan:</span>
      <Select value={currentFilter} onValueChange={(value: any) => onFilterChange(value)}>
        <SelectTrigger className="h-8 w-[130px]">
          <SelectValue placeholder="Pilih periode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Harian</SelectItem>
          <SelectItem value="weekly">Mingguan</SelectItem>
          <SelectItem value="monthly">Bulanan</SelectItem>
          <SelectItem value="yearly">Tahunan</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductFilterOptions;
