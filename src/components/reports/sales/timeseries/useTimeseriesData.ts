
import { useMemo } from 'react';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

export const useTimeseriesData = (
  salesData: any[],
  currentPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly',
  metric: 'quantity' | 'revenue' | 'profit' | 'margin'
) => {
  const chartData = useMemo(() => {
    if (!salesData || salesData.length === 0) {
      return [];
    }

    // Process sales data by time periods
    const salesByPeriod = new Map();
    
    salesData.forEach(sale => {
      if (!sale.transaction_date) return;
      
      const date = parseISO(sale.transaction_date);
      let periodKey: string;
      
      switch (currentPeriod) {
        case 'daily':
          periodKey = format(date, 'yyyy-MM-dd');
          break;
        case 'weekly':
          const weekStart = startOfWeek(date, { locale: id });
          periodKey = format(weekStart, 'yyyy-MM-dd');
          break;
        case 'monthly':
          periodKey = format(date, 'yyyy-MM');
          break;
        case 'yearly':
          periodKey = format(date, 'yyyy');
          break;
        default:
          periodKey = format(date, 'yyyy-MM-dd');
      }
      
      if (!salesByPeriod.has(periodKey)) {
        salesByPeriod.set(periodKey, {
          date: periodKey,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          margin: 0
        });
      }
      
      const periodData = salesByPeriod.get(periodKey);
      const quantity = sale.quantity || 0;
      const revenue = Number(sale.total_price || 0);
      const costPrice = sale.produk?.cost_price || 0;
      const cost = costPrice * quantity;
      const profit = revenue - cost;
      
      periodData.quantity += quantity;
      periodData.revenue += revenue;
      periodData.cost += cost;
      periodData.profit += profit;
      periodData.margin = periodData.revenue > 0 ? (periodData.profit / periodData.revenue) * 100 : 0;
    });
    
    // Convert Map to array and sort by date
    let result = Array.from(salesByPeriod.values());
    result.sort((a, b) => a.date.localeCompare(b.date));
    
    // Format date labels based on period
    result = result.map(item => {
      let displayDate;
      switch (currentPeriod) {
        case 'daily':
          displayDate = format(parseISO(item.date), 'd MMM', { locale: id });
          break;
        case 'weekly':
          const weekStart = parseISO(item.date);
          const weekEnd = addDays(weekStart, 6);
          displayDate = `${format(weekStart, 'd', { locale: id })}-${format(weekEnd, 'd MMM', { locale: id })}`;
          break;
        case 'monthly':
          displayDate = format(parseISO(`${item.date}-01`), 'MMM yyyy', { locale: id });
          break;
        case 'yearly':
          displayDate = item.date;
          break;
        default:
          displayDate = item.date;
      }
      return { ...item, displayDate };
    });
    
    return result;
  }, [salesData, currentPeriod]);

  const isEmpty = !chartData || chartData.length === 0;

  const getPeriodLabel = () => {
    switch (currentPeriod) {
      case 'daily':
        return 'Harian';
      case 'weekly':
        return 'Mingguan';
      case 'monthly':
        return 'Bulanan';
      case 'yearly':
        return 'Tahunan';
      default:
        return '';
    }
  };

  return { chartData, isEmpty, getPeriodLabel };
};
