
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useChartFormatters } from './useChartFormatters';

interface TimeseriesChartProps {
  chartData: any[];
  metric: 'quantity' | 'revenue' | 'profit' | 'margin';
}

export const TimeseriesChart = ({ chartData, metric }: TimeseriesChartProps) => {
  const { getYAxisLabel, formatTooltipValue, formatYAxis, getChartColor } = useChartFormatters(metric);

  return (
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
  );
};
