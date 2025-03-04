
// Get start date for period filtering
export const getStartDateForPeriod = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  const today = new Date();
  switch (period) {
    case 'daily':
      // For daily period, set to the start of today (midnight)
      return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    case 'weekly':
      // For weekly period, get the first day of the current week (Sunday)
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
  if (!data || data.length === 0) {
    console.log(`No data to filter for period: ${period}`);
    return [];
  }
  
  const startDate = getStartDateForPeriod(period);
  console.log(`Filtering data for period: ${period}, start date: ${startDate}`);
  
  const filteredData = data.filter(sale => {
    if (!sale.transaction_date) {
      console.log("Sale missing transaction_date:", sale);
      return false;
    }
    const saleDate = new Date(sale.transaction_date);
    return saleDate >= startDate;
  });
  
  console.log(`Filtered ${data.length} records to ${filteredData.length} for period: ${period}`);
  return filteredData;
};

// Calculate sales statistics
export const calculateSalesStats = (salesData: any[] | null) => {
  if (!salesData || salesData.length === 0) {
    console.log("No sales data for statistics calculation");
    return {
      totalTransactions: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      profitMarginPercentage: "0"
    };
  }

  console.log(`Calculating stats for ${salesData.length} transactions`);
  
  const totalTransactions = salesData.length || 0;
  const totalRevenue = salesData.reduce((sum, sale) => sum + Number(sale.total_price || 0), 0) || 0;
  
  // Calculate total cost
  const totalCost = salesData.reduce((sum, sale) => {
    const costPrice = sale.produk?.cost_price || 0;
    return sum + (costPrice * (sale.quantity || 0));
  }, 0) || 0;
  
  const totalProfit = totalRevenue - totalCost;
  
  // Calculate profit margin percentage
  const profitMarginPercentage = totalRevenue > 0 
    ? ((totalProfit / totalRevenue) * 100).toFixed(2) 
    : "0";

  console.log("Sales statistics:", {
    totalTransactions,
    totalRevenue,
    totalCost,
    totalProfit,
    profitMarginPercentage
  });

  return {
    totalTransactions,
    totalRevenue,
    totalCost,
    totalProfit,
    profitMarginPercentage
  };
};

// Process product sales data with proper type assertions
export const processProductSales = (filteredSales: any[]): ProductSale[] => {
  if (!filteredSales || filteredSales.length === 0) {
    console.log("No filtered sales data to process for products");
    return [];
  }

  console.log(`Processing ${filteredSales.length} sales records for product sales`);
  
  const productSalesMap = filteredSales.reduce((acc: Record<string, ProductSale>, sale) => {
    if (!sale.produk) {
      console.log("Sale missing produk data:", sale);
      return acc;
    }
    
    if (sale.produk && sale.produk.product_name) {
      const productName = sale.produk.product_name;
      const productId = sale.produk.produk_id;
      const costPrice = sale.produk.cost_price || 0;
      const quantity = sale.quantity || 0;
      const totalPrice = Number(sale.total_price || 0);
      
      if (!acc[productId]) {
        acc[productId] = {
          name: productName,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0
        };
      }
      
      acc[productId].quantity += quantity;
      acc[productId].revenue += totalPrice;
      acc[productId].cost += (costPrice * quantity);
      acc[productId].profit = acc[productId].revenue - acc[productId].cost;
    }
    return acc;
  }, {});

  // Explicitly type and return as ProductSale[]
  return Object.values(productSalesMap) as ProductSale[];
};

// Process category sales data
export const processCategorySales = (filteredSales: any[]) => {
  if (!filteredSales || filteredSales.length === 0) {
    console.log("No filtered sales data to process for categories");
    return {};
  }

  console.log(`Processing ${filteredSales.length} sales records for category sales`);
  
  const categorySales = filteredSales.reduce((acc: Record<string, any>, sale) => {
    if (!sale.produk || !sale.produk.kategori_produk) {
      console.log("Sale missing category data:", sale);
      return acc;
    }
    
    if (sale.produk?.kategori_produk?.kategori_name) {
      const category = sale.produk.kategori_produk.kategori_name;
      const costPrice = sale.produk.cost_price || 0;
      const quantity = sale.quantity || 0;
      const totalPrice = Number(sale.total_price || 0);
      
      if (!acc[category]) {
        acc[category] = {
          revenue: 0,
          cost: 0,
          profit: 0
        };
      }
      
      acc[category].revenue += totalPrice;
      acc[category].cost += (costPrice * quantity);
      acc[category].profit = acc[category].revenue - acc[category].cost;
    }
    return acc;
  }, {});

  console.log(`Processed ${Object.keys(categorySales).length} categories from sales data`);
  return categorySales;
};

export interface ProductSale {
  name: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}
