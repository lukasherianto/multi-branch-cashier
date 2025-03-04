
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductSale } from './utils';

type MetricType = 'quantity' | 'revenue' | 'profit' | 'margin';

interface ProductSalesChartProps {
  productSales: ProductSale[];
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  currentPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const ProductSalesChart = ({ 
  productSales, 
  onPeriodChange,
  currentPeriod
}: ProductSalesChartProps) => {
  const [metric, setMetric] = useState<MetricType>('revenue');

  // Sort and limit data to top 20 based on selected metric
  const getChartData = () => {
    if (!productSales || productSales.length === 0) {
      return [];
    }

    let sortedData = [...productSales];
    
    if (metric === 'margin') {
      // Calculate margin percentage for each product
      sortedData = sortedData.map(product => ({
        ...product,
        margin: product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0
      })).sort((a: any, b: any) => b.margin - a.margin);
    } else {
      // Sort by the selected metric
      sortedData = sortedData.sort((a: any, b: any) => b[metric] - a[metric]);
    }

    // Take top 20 and format for chart
    return sortedData.slice(0, 20).map(product => ({
      name: product.name,
      value: metric === 'margin' 
        ? product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0
        : product[metric]
    }));
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

  const COLORS = [
    '#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#2dd4bf', '#fb7185', '#a855f7',
    '#0ea5e9', '#22c55e', '#818cf8', '#fbbf24', '#f87171',
    '#a78bfa', '#f472b6', '#34d399', '#f43f5e', '#d946ef'
  ];

  const isEmpty = !chartData || chartData.length === 0;

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <h3 className="text-lg font-medium mb-4 sm:mb-0">Top 20 Produk</h3>
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
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 40, bottom: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100} 
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
                labelFormatter={(label) => `Produk: ${label}`}
              />
              <Bar dataKey="value" fill="#3b82f6">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default ProductSalesChart;
