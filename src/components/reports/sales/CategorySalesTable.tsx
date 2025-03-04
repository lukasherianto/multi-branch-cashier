
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import ProductFilterOptions from "./ProductFilterOptions";
import { useState } from "react";

interface CategorySalesTableProps {
  categorySales: Record<string, { revenue: number, cost: number, profit: number }> | Record<string, number>;
  showProfit?: boolean;
  onCategoryPeriodChange?: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
}

const CategorySalesTable = ({ 
  categorySales, 
  showProfit = false,
  onCategoryPeriodChange
}: CategorySalesTableProps) => {
  const [currentFilter, setCurrentFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  const hasDetailedData = Object.values(categorySales).some(value => typeof value === 'object');
  
  let sortedCategories: any[];
  
  if (hasDetailedData) {
    // New format with profit data
    sortedCategories = Object.entries(categorySales)
      .sort(([, a], [, b]) => (b as any).revenue - (a as any).revenue);
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

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-xl font-semibold">Penjualan per Kategori</h3>
        {onCategoryPeriodChange && (
          <ProductFilterOptions 
            onFilterChange={handleFilterChange}
            currentFilter={currentFilter}
          />
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Pendapatan</TableHead>
            {showProfit && hasDetailedData && (
              <>
                <TableHead className="text-right">Modal</TableHead>
                <TableHead className="text-right">Keuntungan</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCategories.map(([category, data]) => (
            <TableRow key={category}>
              <TableCell>{category}</TableCell>
              
              {hasDetailedData ? (
                // New format with detailed data
                <>
                  <TableCell className="text-right">
                    Rp {(data as any).revenue.toLocaleString("id-ID")}
                  </TableCell>
                  {showProfit && (
                    <>
                      <TableCell className="text-right">
                        Rp {(data as any).cost.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        Rp {(data as any).profit.toLocaleString("id-ID")}
                      </TableCell>
                    </>
                  )}
                </>
              ) : (
                // Old format with just the value
                <TableCell className="text-right">
                  Rp {(data as number).toLocaleString("id-ID")}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CategorySalesTable;
