
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

export interface ProductSale {
  name: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}

interface ProductSalesTableProps {
  productSales: ProductSale[] | Record<string, number>;
  title: string;
  limit?: number;
  showProfit?: boolean;
  onProductPeriodChange?: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
}

const ProductSalesTable = ({ 
  productSales, 
  title, 
  limit, 
  showProfit = false,
  onProductPeriodChange
}: ProductSalesTableProps) => {
  const [currentFilter, setCurrentFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  // Handle both the new format (array of objects) and the old format (record of product name to quantity)
  let sortedProducts: any[] = [];
  
  if (Array.isArray(productSales)) {
    // New format
    sortedProducts = [...productSales].sort((a, b) => b.quantity - a.quantity);
    if (limit) {
      sortedProducts = sortedProducts.slice(0, limit);
    }
  } else {
    // Old format (for backward compatibility)
    sortedProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit);
  }

  const handleFilterChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setCurrentFilter(period);
    if (onProductPeriodChange) {
      onProductPeriodChange(period);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        {onProductPeriodChange && (
          <ProductFilterOptions 
            onFilterChange={handleFilterChange}
            currentFilter={currentFilter}
          />
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produk</TableHead>
            <TableHead className="text-right">Jumlah Terjual</TableHead>
            {showProfit && (
              <>
                <TableHead className="text-right">Pendapatan</TableHead>
                <TableHead className="text-right">Modal</TableHead>
                <TableHead className="text-right">Keuntungan</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(productSales) ? (
            // New format
            sortedProducts.map((product, index) => (
              <TableRow key={index}>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-right">{product.quantity}</TableCell>
                {showProfit && (
                  <>
                    <TableCell className="text-right">Rp {product.revenue.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right">Rp {product.cost.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right">Rp {product.profit.toLocaleString("id-ID")}</TableCell>
                  </>
                )}
              </TableRow>
            ))
          ) : (
            // Old format
            sortedProducts.map(([product, quantity]) => (
              <TableRow key={product}>
                <TableCell>{product}</TableCell>
                <TableCell className="text-right">{quantity}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProductSalesTable;
