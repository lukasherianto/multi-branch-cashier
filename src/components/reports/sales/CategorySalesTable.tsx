
import React from 'react';
import { Card } from "@/components/ui/card";
import CategorySalesHeader from './category/CategorySalesHeader';
import CategorySalesBody from './category/CategorySalesBody';
import { useCategorySales } from './category/useCategorySales';
import { CategorySalesRecord } from './category/types';

interface CategorySalesTableProps {
  categorySales: CategorySalesRecord;
  showProfit?: boolean;
  onCategoryPeriodChange?: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
}

const CategorySalesTable = ({ 
  categorySales, 
  showProfit = false,
  onCategoryPeriodChange
}: CategorySalesTableProps) => {
  const {
    currentFilter,
    hasDetailedData,
    sortedCategories,
    handleFilterChange,
    isEmpty
  } = useCategorySales(categorySales, onCategoryPeriodChange);

  return (
    <Card className="p-6">
      <CategorySalesHeader
        onCategoryPeriodChange={onCategoryPeriodChange}
        currentFilter={currentFilter}
      />
      <CategorySalesBody
        sortedCategories={sortedCategories}
        showProfit={showProfit}
        hasDetailedData={hasDetailedData}
        isEmpty={isEmpty}
      />
    </Card>
  );
};

export default CategorySalesTable;
