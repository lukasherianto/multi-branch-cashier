
import { useAuth } from "@/hooks/auth";
import SalesSummary from "./sales/SalesSummary";
import ProductSalesTable, { ProductSale } from "./sales/ProductSalesTable";
import CategorySalesTable from "./sales/CategorySalesTable";
import DateRangeFilter from "./sales/DateRangeFilter";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useReportData } from "@/hooks/reports/useReportData";
import { 
  filterSalesByPeriod, 
  calculateSalesStats, 
  processProductSales, 
  processCategorySales 
} from "./sales/utils";

const SalesReport = () => {
  const { pelakuUsaha } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Default to first day of current month
    end: new Date(),
    period: 'monthly' as 'daily' | 'monthly' | 'yearly' | 'custom'
  });
  
  const [productPeriod, setProductPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [categoryPeriod, setCategoryPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const { salesData } = useReportData(pelakuUsaha, dateRange);

  const handleFilterChange = (range: { 
    start: Date | undefined; 
    end: Date | undefined; 
    period: 'daily' | 'monthly' | 'yearly' | 'custom' 
  }) => {
    setDateRange(range);
  };

  const handleProductPeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setProductPeriod(period);
  };

  const handleCategoryPeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setCategoryPeriod(period);
  };

  // Calculate sales statistics
  const { 
    totalTransactions, 
    totalRevenue, 
    totalProfit, 
    profitMarginPercentage 
  } = calculateSalesStats(salesData);

  // Filter and process product sales data
  const filteredProductSales = filterSalesByPeriod(salesData, productPeriod);
  const productSalesArray: ProductSale[] = processProductSales(filteredProductSales);

  // Filter and process category sales data
  const filteredCategorySales = filterSalesByPeriod(salesData, categoryPeriod);
  const categorySales = processCategorySales(filteredCategorySales);

  if (!pelakuUsaha) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Silakan lengkapi profil usaha Anda terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DateRangeFilter onFilterChange={handleFilterChange} />
      
      <SalesSummary
        totalTransactions={totalTransactions}
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        profitMarginPercentage={profitMarginPercentage}
      />

      <ProductSalesTable
        productSales={productSalesArray}
        title="Produk Terlaris"
        limit={10}
        showProfit={true}
        onProductPeriodChange={handleProductPeriodChange}
      />

      <Separator className="my-6" />

      <CategorySalesTable 
        categorySales={categorySales} 
        showProfit={true}
        onCategoryPeriodChange={handleCategoryPeriodChange}
      />
    </div>
  );
};

export default SalesReport;
