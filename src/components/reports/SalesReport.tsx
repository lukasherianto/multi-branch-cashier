
import { useAuth } from "@/hooks/auth";
import SalesSummary from "./sales/SalesSummary";
import ProductSalesTable, { ProductSale } from "./sales/ProductSalesTable";
import CategorySalesTable from "./sales/CategorySalesTable";
import DateRangeFilter from "./sales/DateRangeFilter";
import ProductSalesChart from "./sales/ProductSalesChart";
import SalesTimeSeriesChart from "./sales/SalesTimeSeriesChart";
import { useState, useEffect } from "react";
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
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [timeseriesPeriod, setTimeseriesPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const { salesData, isLoading, error } = useReportData(pelakuUsaha, dateRange);

  useEffect(() => {
    console.log("Auth state:", { pelakuUsaha });
    console.log("Date range:", dateRange);
    console.log("Raw sales data:", salesData);
    console.log("Loading state:", isLoading);
    console.log("Error state:", error);
  }, [pelakuUsaha, salesData, dateRange, isLoading, error]);

  const handleFilterChange = (range: { 
    start: Date | undefined; 
    end: Date | undefined; 
    period: 'daily' | 'monthly' | 'yearly' | 'custom' 
  }) => {
    console.log("Filter changed to:", range);
    setDateRange(range);
  };

  const handleProductPeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    console.log("Product period changed to:", period);
    setProductPeriod(period);
  };

  const handleCategoryPeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    console.log("Category period changed to:", period);
    setCategoryPeriod(period);
  };

  const handleChartPeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    console.log("Chart period changed to:", period);
    setChartPeriod(period);
  };

  const handleTimeseriesPeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    console.log("Timeseries period changed to:", period);
    setTimeseriesPeriod(period);
  };

  // Calculate sales statistics
  const { 
    totalTransactions, 
    totalRevenue, 
    totalProfit, 
    profitMarginPercentage 
  } = calculateSalesStats(salesData);

  // Filter and process chart data
  const filteredChartSales = filterSalesByPeriod(salesData, chartPeriod);
  console.log("Filtered chart sales:", filteredChartSales);
  
  const chartProductSales: ProductSale[] = processProductSales(filteredChartSales);
  console.log("Processed chart product sales:", chartProductSales);

  // Filter and process product sales data
  const filteredProductSales = filterSalesByPeriod(salesData, productPeriod);
  console.log("Filtered product sales:", filteredProductSales);
  
  const productSalesArray: ProductSale[] = processProductSales(filteredProductSales);
  console.log("Processed product sales array:", productSalesArray);

  // Filter and process category sales data
  const filteredCategorySales = filterSalesByPeriod(salesData, categoryPeriod);
  console.log("Filtered category sales:", filteredCategorySales);
  
  const categorySales = processCategorySales(filteredCategorySales);
  console.log("Processed category sales:", categorySales);

  if (!pelakuUsaha) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Silakan lengkapi profil usaha Anda terlebih dahulu</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error: {error.message || "Terjadi kesalahan saat memuat data"}</p>
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

      <ProductSalesChart 
        productSales={chartProductSales}
        onPeriodChange={handleChartPeriodChange}
        currentPeriod={chartPeriod}
      />

      <Separator className="my-6" />
      
      <SalesTimeSeriesChart 
        salesData={salesData || []}
        onPeriodChange={handleTimeseriesPeriodChange}
        currentPeriod={timeseriesPeriod}
      />

      <Separator className="my-6" />

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
