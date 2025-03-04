
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, startOfWeek, startOfMonth, startOfYear, addDays, addMonths, addWeeks, addYears } from 'date-fns';
import { id } from 'date-fns/locale';

type MetricType = 'quantity' | 'revenue' | 'profit' | 'margin';
type TimeseriesPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface SalesTimeSeriesChartProps {
  salesData: any[];
  onPeriodChange?: (period: TimeseriesPeriod) => void;
  currentPeriod: TimeseriesPeriod;
}

const SalesTimeSeriesChart = ({ 
  salesData, 
  onPeriodChange,
  currentPeriod
}: SalesTimeSeriesChartProps) => {
  const [metric, setMetric] = useState<MetricType>('revenue');

  const getChartData = () => {
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
  };

  const chartData = getChartData();

  const getYAxisLabel = () => {
    switch (metric) {
      case 'quantity':
        return 'Jumlah';
      case 'revenue':
        return 'Pendapatan (Rp)';
      case 'profit':
        return 'Keuntungan (Rp)';
      case 'margin':
        return 'Margin (%)';
      default:
        return '';
    }
  };

  const formatTooltipValue = (value: number) => {
    if (metric === 'quantity') {
      return `${value.toFixed(0)}`;
    } else if (metric === 'margin') {
      return `${value.toFixed(2)}%`;
    } else {
      return `Rp ${value.toLocaleString('id-ID')}`;
    }
  };

  const formatYAxis = (value: number) => {
    if (metric === 'quantity') {
      return value.toFixed(0);
    } else if (metric === 'margin') {
      return `${value.toFixed(0)}%`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const getChartColor = () => {
    switch (metric) {
      case 'quantity':
        return '#3b82f6'; // blue
      case 'revenue':
        return '#10b981'; // green
      case 'profit':
        return '#f59e0b'; // amber
      case 'margin':
        return '#8b5cf6'; // purple
      default:
        return '#3b82f6';
    }
  };

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

  const isEmpty = !chartData || chartData.length === 0;

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <h3 className="text-lg font-medium mb-4 sm:mb-0">Penjualan {getPeriodLabel()}</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={currentPeriod} onValueChange={(value: any) => onPeriodChange?.(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih metrik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quantity">Total Transaksi</SelectItem>
              <SelectItem value="revenue">Total Pendapatan</SelectItem>
              <SelectItem value="profit">Total Keuntungan</SelectItem>
              <SelectItem value="margin">Margin Keuntungan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <p>Tidak ada data untuk ditampilkan</p>
        </div>
      ) : (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: getYAxisLabel(), 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
                tickFormatter={formatYAxis}
              />
              <Tooltip 
                formatter={(value: number) => [formatTooltipValue(value), getYAxisLabel()]}
                labelFormatter={(label) => `Periode: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={metric} 
                stroke={getChartColor()} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={getYAxisLabel()}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default SalesTimeSeriesChart;
