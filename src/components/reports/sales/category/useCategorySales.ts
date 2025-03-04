
import { useState } from 'react';
import { CategorySalesRecord, CategorySalesData } from './types';

export const useCategorySales = (
  categorySales: CategorySalesRecord,
  onCategoryPeriodChange?: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void
) => {
  const [currentFilter, setCurrentFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  const hasDetailedData = Object.values(categorySales).some(value => typeof value === 'object');
  
  let sortedCategories: [string, CategorySalesData | number][];
  
  if (hasDetailedData) {
    // New format with profit data
    sortedCategories = Object.entries(categorySales)
      .sort(([, a], [, b]) => (b as CategorySalesData).revenue - (a as CategorySalesData).revenue);
  } else {
    // Old format with just revenue
    sortedCategories = Object.entries(categorySales)
      .sort(([, a], [, b]) => (b as number) - (a as number));
  }

  const handleFilterChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setCurrentFilter(period);
    if (onCategoryPeriodChange) {
      onCategoryPeriodChange(period);
    }
  };

  return {
    currentFilter,
    hasDetailedData,
    sortedCategories,
    handleFilterChange
  };
};
