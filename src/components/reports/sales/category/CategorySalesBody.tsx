
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategorySalesData } from './types';

interface CategorySalesBodyProps {
  sortedCategories: [string, CategorySalesData | number][];
  showProfit?: boolean;
  hasDetailedData: boolean;
}

const CategorySalesBody: React.FC<CategorySalesBodyProps> = ({ 
  sortedCategories, 
  showProfit = false, 
  hasDetailedData 
}) => {
  return (
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
                  Rp {(data as CategorySalesData).revenue.toLocaleString("id-ID")}
                </TableCell>
                {showProfit && (
                  <>
                    <TableCell className="text-right">
                      Rp {(data as CategorySalesData).cost.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {(data as CategorySalesData).profit.toLocaleString("id-ID")}
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
  );
};

export default CategorySalesBody;
