
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { TimeseriesControls } from './TimeseriesControls';
import { TimeseriesChart } from './TimeseriesChart';
import { EmptyState } from './EmptyState';
import { useTimeseriesData } from './useTimeseriesData';

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
  const [metric, setMetric] = useState<'quantity' | 'revenue' | 'profit' | 'margin'>('revenue');
  
  const { chartData, isEmpty, getPeriodLabel } = useTimeseriesData(salesData, currentPeriod, metric);

  const handleMetricChange = (value: 'quantity' | 'revenue' | 'profit' | 'margin') => {
    setMetric(value);
  };

  return (
    <Card className="p-6">
      <TimeseriesControls 
        currentPeriod={currentPeriod}
        metric={metric}
        onPeriodChange={onPeriodChange}
        onMetricChange={handleMetricChange}
        periodLabel={getPeriodLabel()}
      />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <TimeseriesChart 
          chartData={chartData}
          metric={metric}
        />
      )}
    </Card>
  );
};

export default SalesTimeSeriesChart;
