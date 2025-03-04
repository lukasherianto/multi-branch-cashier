
import React from 'react';
import ProductFilterOptions from '../ProductFilterOptions';

interface CategorySalesHeaderProps {
  onCategoryPeriodChange?: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  currentFilter: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const CategorySalesHeader: React.FC<CategorySalesHeaderProps> = ({ 
  onCategoryPeriodChange,
  currentFilter
}) => {
  const handleFilterChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    if (onCategoryPeriodChange) {
      onCategoryPeriodChange(period);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
      <h3 className="text-xl font-semibold">Penjualan per Kategori</h3>
      {onCategoryPeriodChange && (
        <ProductFilterOptions 
          onFilterChange={handleFilterChange}
          currentFilter={currentFilter}
        />
      )}
    </div>
  );
};

export default CategorySalesHeader;
