// Get start date for period filtering
export const getStartDateForPeriod = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
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
export const filterSalesByPeriod = (data: any[] | null, period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  if (!data) return [];
  
  const startDate = getStartDateForPeriod(period);
  
  return data.filter(sale => {
    const saleDate = new Date(sale.transaction_date);
    return saleDate >= startDate;
  });
};

// Calculate sales statistics
export const calculateSalesStats = (salesData: any[] | null) => {
  if (!salesData) {
    return {
      totalTransactions: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      profitMarginPercentage: "0"
    };
  }

  const totalTransactions = salesData.length || 0;
  const totalRevenue = salesData.reduce((sum, sale) => sum + Number(sale.total_price), 0) || 0;
  
  // Calculate total cost
  const totalCost = salesData.reduce((sum, sale) => {
    const costPrice = sale.produk?.cost_price || 0;
    return sum + (costPrice * sale.quantity);
  }, 0) || 0;
  
  const totalProfit = totalRevenue - totalCost;
  
  // Calculate profit margin percentage
  const profitMarginPercentage = totalRevenue > 0 
    ? ((totalProfit / totalRevenue) * 100).toFixed(2) 
    : "0";

  return {
    totalTransactions,
    totalRevenue,
    totalCost,
    totalProfit,
    profitMarginPercentage
  };
};

// Process product sales data
export const processProductSales = (filteredSales: any[]): ProductSale[] => {
  const productSalesMap = filteredSales.reduce((acc: Record<string, ProductSale>, sale) => {
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
  }, {});

  return Object.values(productSalesMap);
};

// Process category sales data
export const processCategorySales = (filteredSales: any[]) => {
  return filteredSales.reduce((acc, sale) => {
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
  }, {});
};

export interface ProductSale {
  name: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}
