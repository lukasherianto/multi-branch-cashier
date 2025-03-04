
export interface CategorySalesData {
  revenue: number;
  cost: number;
  profit: number;
}

export type CategorySalesRecord = Record<string, CategorySalesData | number>;
