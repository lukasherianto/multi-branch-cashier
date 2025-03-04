
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import StatCard from "./shared/StatCard";
import ProductSalesTable from "./sales/ProductSalesTable";
import CategorySalesTable from "./sales/CategorySalesTable";
import DateRangeFilter from "./sales/DateRangeFilter";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const SalesReport = () => {
  const { pelakuUsaha } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Default to first day of current month
    end: new Date(),
    period: 'monthly' as 'daily' | 'monthly' | 'yearly' | 'custom'
  });
  
  const [productPeriod, setProductPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [categoryPeriod, setCategoryPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales-report", pelakuUsaha?.pelaku_usaha_id, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!pelakuUsaha) return null;

      const startDate = dateRange.start ? dateRange.start.toISOString() : undefined;
      const endDate = dateRange.end ? new Date(dateRange.end.setHours(23, 59, 59, 999)).toISOString() : undefined;

      let query = supabase
        .from("transaksi")
        .select(`
          transaksi_id,
          quantity,
          total_price,
          produk:produk_id (
            produk_id,
            product_name,
            cost_price,
            kategori_produk (
              kategori_name
            )
          ),
          cabang:cabang_id (
            branch_name
          )
        `);

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query.order('transaction_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!pelakuUsaha
  });

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

  const totalTransactions = salesData?.length || 0;
  const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_price), 0) || 0;
  
  // Calculate total cost and profit
  const totalCost = salesData?.reduce((sum, sale) => {
    const costPrice = sale.produk?.cost_price || 0;
    return sum + (costPrice * sale.quantity);
  }, 0) || 0;
  
  const totalProfit = totalRevenue - totalCost;
  
  // Calculate profit margin percentage
  const profitMarginPercentage = totalRevenue > 0 
    ? ((totalProfit / totalRevenue) * 100).toFixed(2) 
    : "0";

  // Get start date for period filtering
  const getStartDateForPeriod = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const today = new Date();
    switch (period) {
      case 'daily':
        return new Date(today.setHours(0, 0, 0, 0));
      case 'weekly':
        const day = today.getDay();
        return new Date(today.setDate(today.getDate() - day));
      case 'monthly':
        return new Date(today.getFullYear(), today.getMonth(), 1);
      case 'yearly':
        return new Date(today.getFullYear(), 0, 1);
      default:
        return new Date(today.getFullYear(), today.getMonth(), 1);
    }
  };

  // Filter sales data by period
  const filterSalesByPeriod = (data: any[] | null, period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    if (!data) return [];
    
    const startDate = getStartDateForPeriod(period);
    
    return data.filter(sale => {
      const saleDate = new Date(sale.transaction_date);
      return saleDate >= startDate;
    });
  };

  // Filter product sales by selected period
  const filteredProductSales = filterSalesByPeriod(salesData, productPeriod);
  
  const productSales = filteredProductSales.reduce((acc, sale) => {
    if (sale.produk && sale.produk.product_name) {
      const productName = sale.produk.product_name;
      const productId = sale.produk.produk_id;
      const costPrice = sale.produk.cost_price || 0;
      
      if (!acc[productId]) {
        acc[productId] = {
          name: productName,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0
        };
      }
      
      acc[productId].quantity += sale.quantity;
      acc[productId].revenue += Number(sale.total_price);
      acc[productId].cost += (costPrice * sale.quantity);
      acc[productId].profit = acc[productId].revenue - acc[productId].cost;
    }
    return acc;
  }, {} as Record<string, { name: string, quantity: number, revenue: number, cost: number, profit: number }>) || {};

  // Filter category sales by selected period
  const filteredCategorySales = filterSalesByPeriod(salesData, categoryPeriod);
  
  const categorySales = filteredCategorySales.reduce((acc, sale) => {
    if (sale.produk?.kategori_produk?.kategori_name) {
      const category = sale.produk.kategori_produk.kategori_name;
      const costPrice = sale.produk.cost_price || 0;
      
      if (!acc[category]) {
        acc[category] = {
          revenue: 0,
          cost: 0,
          profit: 0
        };
      }
      
      acc[category].revenue += Number(sale.total_price);
      acc[category].cost += (costPrice * sale.quantity);
      acc[category].profit = acc[category].revenue - acc[category].cost;
    }
    return acc;
  }, {} as Record<string, { revenue: number, cost: number, profit: number }>) || {};

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transaksi"
          value={totalTransactions}
        />
        <StatCard
          title="Total Pendapatan"
          value={`Rp ${totalRevenue.toLocaleString("id-ID")}`}
        />
        <StatCard
          title="Total Keuntungan"
          value={`Rp ${totalProfit.toLocaleString("id-ID")}`}
        />
        <StatCard
          title="Margin Keuntungan"
          value={`${profitMarginPercentage}%`}
        />
      </div>

      <ProductSalesTable
        productSales={Object.values(productSales)}
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
