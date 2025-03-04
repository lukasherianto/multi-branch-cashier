
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useChartFormatters } from './useChartFormatters';

interface TimeseriesChartProps {
  chartData: any[];
  metric: 'quantity' | 'revenue' | 'profit' | 'margin';
}

export const TimeseriesChart = ({ chartData, metric }: TimeseriesChartProps) => {
  const { getYAxisLabel, formatTooltipValue, formatYAxis, getChartColor } = useChartFormatters(metric);
  
  // Limit chart data to the last 10 periods
  const limitedChartData = chartData.slice(-10);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={limitedChartData}
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
          <Bar 
            dataKey={metric} 
            fill={getChartColor()} 
            name={getYAxisLabel()}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
